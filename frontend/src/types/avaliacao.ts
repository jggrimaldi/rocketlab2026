export type AvaliacaoResponse = {
  id_avaliacao: string
  id_pedido: string
  avaliacao: number
  titulo_comentario: string | null
  comentario: string | null
  data_comentario: string | null
  data_resposta: string | null
}

export type AvaliacoesProdutoResponse = {
  media: number
  total_avaliacoes: number
  avaliacoes: AvaliacaoResponse[]
}
