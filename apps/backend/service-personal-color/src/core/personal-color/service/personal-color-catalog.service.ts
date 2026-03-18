import {
  CommonError,
  RnDefaultPcCatalogItemEntity,
  RnDefaultUploadFileEntity,
} from '@capstone-project/glb-commons';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PersonalColorError } from '../error/personal-color.error';
import { PcCatalogItemView } from '../types/personal-color.types';
import { PersonalColorUrlService } from './personal-color-url.service';

@Injectable()
export class PersonalColorCatalogService {
  constructor(
    @InjectRepository(RnDefaultPcCatalogItemEntity)
    private readonly catalogRepository: Repository<RnDefaultPcCatalogItemEntity>,
    @InjectRepository(RnDefaultUploadFileEntity)
    private readonly uploadFileRepository: Repository<RnDefaultUploadFileEntity>,
    private readonly personalColorUrlService: PersonalColorUrlService,
  ) {}

  async getActiveCatalogItems(): Promise<PcCatalogItemView[]> {
    const items = await this.catalogRepository.find({
      where: {
        activeYn: true,
      },
      order: {
        sortNo: 'ASC',
        id: 'ASC',
      },
    });

    return this.attachImageUrls(items);
  }

  async getCatalogItemsByIds(
    itemIds: Array<number | null | undefined>,
  ): Promise<Map<number, PcCatalogItemView>> {
    const distinctIds = Array.from(
      new Set(itemIds.filter((value): value is number => typeof value === 'number')),
    );
    if (distinctIds.length === 0) {
      return new Map();
    }

    const items = await this.catalogRepository.find({
      where: {
        id: In(distinctIds),
        activeYn: true,
      },
      order: {
        sortNo: 'ASC',
        id: 'ASC',
      },
    });

    const itemViews = await this.attachImageUrls(items);
    return new Map(itemViews.map((item) => [item.itemId, item]));
  }

  async getRequiredCatalogSelection(options: {
    topItemId: number;
    bottomItemId: number;
    accessoryItemId?: number;
  }) {
    const items = await this.getCatalogItemsByIds([
      options.topItemId,
      options.bottomItemId,
      options.accessoryItemId,
    ]);

    const top = items.get(options.topItemId);
    const bottom = items.get(options.bottomItemId);
    const accessory =
      typeof options.accessoryItemId === 'number'
        ? items.get(options.accessoryItemId) ?? null
        : null;

    if (!top || !bottom) {
      throw CommonError.createByErrorCode(PersonalColorError.CATALOG_ITEM_NOT_FOUND);
    }

    return {
      top,
      bottom,
      accessory,
    };
  }

  private async attachImageUrls(
    items: RnDefaultPcCatalogItemEntity[],
  ): Promise<PcCatalogItemView[]> {
    if (items.length === 0) {
      return [];
    }

    const uploadFiles = await this.uploadFileRepository.find({
      where: {
        id: In(items.map((item) => item.imageFileId)),
      },
    });
    const uploadFileMap = new Map(uploadFiles.map((file) => [file.id, file]));

    return items
      .map((item) => {
        const file = uploadFileMap.get(item.imageFileId);
        if (!file) {
          return null;
        }

        return {
          itemId: item.id,
          itemType: item.itemType,
          name: item.name,
          imageFileId: item.imageFileId,
          imageUrl: this.personalColorUrlService.buildFileDownloadUrl(
            file.storageName,
          ),
          dominantColorHex: item.dominantColorHex,
          styleTags: item.styleTags ?? [],
          parsedAttributes: item.parsedAttributes ?? null,
          recommendedSeasons: item.recommendedSeasons ?? [],
          recommendedGenders: item.recommendedGenders ?? [],
          sortNo: item.sortNo,
        } satisfies PcCatalogItemView;
      })
      .filter((item): item is PcCatalogItemView => item !== null);
  }
}
