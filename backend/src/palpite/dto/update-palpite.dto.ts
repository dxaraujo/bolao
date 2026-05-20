import { PartialType } from '@nestjs/mapped-types'
import { CreatePalpiteDto } from './create-palpite.dto'

export class UpdatePalpiteDto extends PartialType(CreatePalpiteDto) {}
