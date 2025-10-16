# Exemplos de uso da API BPA Digital

## 1. Registrar um usuário

```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "senha": "senha123"
  }'
```

## 2. Fazer login

```bash
curl -X POST "http://localhost:8000/auth/login-json" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "senha": "senha123"
  }'
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Copie o token para usar nos próximos requests!**

## 3. Criar um cliente

```bash
curl -X POST "http://localhost:8000/clients/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "status": "ativo",
    "nome_fantasia": "Restaurante Bom Sabor",
    "categoria": "restaurante",
    "razao_social": "Bom Sabor Alimentos Ltda",
    "cnpj": "12.345.678/0001-90",
    "email": "contato@bomsabor.com",
    "telefone_contato_1": "(11) 98765-4321",
    "endereco": "Rua das Flores",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234-567",
    "responsaveis": [
      {
        "tipo": "responsavel_estabelecimento",
        "nome_completo": "Maria Santos",
        "email": "maria@bomsabor.com",
        "telefone": "(11) 91234-5678",
        "cpf": "123.456.789-00"
      }
    ],
    "colaboradores_info": {
      "numero_total_colaboradores": 15,
      "numero_manipuladores_alimentos": 8
    }
  }'
```

## 4. Listar todos os clientes

```bash
curl -X GET "http://localhost:8000/clients/" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 5. Buscar cliente por ID

```bash
curl -X GET "http://localhost:8000/clients/1" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 6. Buscar clientes (com busca)

```bash
curl -X GET "http://localhost:8000/clients/?search=Restaurante" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 7. Atualizar um cliente

```bash
curl -X PUT "http://localhost:8000/clients/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "status": "inativo",
    "telefone_contato_1": "(11) 99999-9999"
  }'
```

## 8. Criar um relatório

```bash
curl -X POST "http://localhost:8000/reports/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "descricao": "Inspeção de Boas Práticas - Janeiro 2025",
    "cliente_id": 1,
    "categoria": "Inspeção Sanitária",
    "responsavel_inspecao_id": 1,
    "categorias": [
      {
        "nome": "Edificação, Isntações e Transporte",
        "ordem": 1,
        "itens": [
          {
            "codigo": "1.1.1",
            "descricao": "Livre de objetos em desuso ou estranhos ao ambiente",
            "ordem": 1
          },
          {
            "codigo": "1.2.1",
            "descricao": "Revestimento liso, impermeável e lavável",
            "ordem": 2
          }
        ]
      },
      {
        "nome": "Preparação do Alimento",
        "ordem": 2,
        "itens": [
          {
            "codigo": "2.1.1",
            "descricao": "Higienização adequada das mãos",
            "ordem": 1
          }
        ]
      }
    ]
  }'
```

## 9. Listar relatórios

```bash
curl -X GET "http://localhost:8000/reports/" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 10. Listar relatórios de um cliente específico

```bash
curl -X GET "http://localhost:8000/reports/?cliente_id=1" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 11. Atualizar resposta de um item do checklist

```bash
curl -X PUT "http://localhost:8000/reports/items/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "resposta": "conforme",
    "observacoes": "Tudo em ordem, ambiente limpo e organizado"
  }'
```

## 12. Finalizar um relatório

```bash
curl -X PUT "http://localhost:8000/reports/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "status": "concluido"
  }'
```

## 13. Deletar um cliente

```bash
curl -X DELETE "http://localhost:8000/clients/1" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 14. Deletar um relatório

```bash
curl -X DELETE "http://localhost:8000/reports/1" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## ⚡ Dica Rápida

**Use o Swagger!** É muito mais fácil:

1. Acesse: http://localhost:8000/docs
2. Clique em "Authorize" (cadeado no topo)
3. Cole seu token
4. Teste todos os endpoints visualmente!
