import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RnDefaultInciIngredientEntity } from '../../entity/default/rn-default-inci-ingredient.mysql-entity';
import { RnBaseRepository } from '../base/rn-base.base-repository';

@Injectable()
export class RnDefaultInciIngredientRepository extends RnBaseRepository<RnDefaultInciIngredientEntity> {
  constructor(
    @InjectRepository(RnDefaultInciIngredientEntity)
    repository: Repository<RnDefaultInciIngredientEntity>,
  ) {
    super(repository);
  }
}
