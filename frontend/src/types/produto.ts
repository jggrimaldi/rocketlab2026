export type Produto = {
  id_produto: string
  nome_produto: string
  categoria_produto: string
  preco: number | null
  peso_produto_gramas: number | null
  comprimento_centimetros: number | null
  altura_centimetros: number | null
  largura_centimetros: number | null
}

export type ProdutoListItem = {
  id_produto: string
  nome_produto: string
  categoria_produto: string
  preco: number
  nome_vendedor: string
  avaliacao_media: number
}

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  skip: number
  limit: number
  pages: number
  current_page: number
  has_next: boolean
  has_previous: boolean
}
