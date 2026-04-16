import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard'
import { JwtPayload } from 'src/guards/jwt-payload.interface'
import { CurrentUser } from 'src/guards/public.decorator'

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly queryBus: QueryBus) {}

  // GET /categories — toutes les catégories actives
  @Get()
  @ApiOperation({ summary: 'Lister toutes les catégories' })
  findAll() {
    return this.queryBus.execute({})
  }

  // GET /categories/count — nb de documents par catégorie pour l'utilisateur
  @Get('count')
  @ApiOperation({ summary: 'Nombre de documents par catégorie' })
  countByCategory(@CurrentUser() user: JwtPayload) {
    return this.queryBus.execute({ userId: user.sub })
  }

  // GET /categories/:slug — détail d'une catégorie
  @Get(':slug')
  @ApiOperation({ summary: 'Détail d\'une catégorie par slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.queryBus.execute({ slug })
  }
}