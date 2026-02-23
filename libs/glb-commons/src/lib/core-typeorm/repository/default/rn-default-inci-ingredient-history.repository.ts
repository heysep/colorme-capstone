import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RnDefaultInciIngredientHistoryEntity } from '../../entity/default/rn-default-inci-ingredient-history.mysql-entity';
import { RnBaseRepository } from '../base/rn-base.base-repository';

@Injectable()
export class RnDefaultInciIngredientHistoryRepository extends RnBaseRepository<RnDefaultInciIngredientHistoryEntity> {
  constructor(
    @InjectRepository(RnDefaultInciIngredientHistoryEntity)
    repository: Repository<RnDefaultInciIngredientHistoryEntity>,
  ) {
    super(repository);
  }
}
