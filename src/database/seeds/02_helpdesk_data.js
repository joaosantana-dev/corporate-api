exports.seed = async (knex) => {
  // Limpeza em ordem de dependência (FK)
  await knex('helpdesk_ticket_comments').del()
  await knex('helpdesk_tech_specialties').del()
  await knex('helpdesk_tickets').del()
  await knex('helpdesk_categories').del()

  // ── Categorias ─────────────────────────────────────────────────────────
  await knex('helpdesk_categories').insert([
    { id: 1, name: 'Hardware',  description: 'Problemas com equipamentos físicos',  color: 'orange' },
    { id: 2, name: 'Software',  description: 'Sistemas, aplicativos e licenças',    color: 'blue'   },
    { id: 3, name: 'Rede',      description: 'Conectividade, VPN, Wi-Fi',           color: 'purple' },
    { id: 4, name: 'Acesso',    description: 'Permissões, senhas e contas',         color: 'green'  },
    { id: 5, name: 'Impressão', description: 'Impressoras e scanners',              color: 'red'    },
    { id: 6, name: 'Outros',    description: 'Demandas diversas',                   color: 'gray'   },
  ])

  // ── Chamados ───────────────────────────────────────────────────────────
  await knex('helpdesk_tickets').insert([
    { id: 1, title: 'Computador não liga',        category_id: 1, priority: 'alta',   status: 'aberto',         user_id: 3, tech_id: 2, sla: '4h',  description: 'Ao pressionar o botão power, o computador não responde.'              },
    { id: 2, title: 'Sem acesso à internet',      category_id: 3, priority: 'critica',status: 'em_atendimento', user_id: 4, tech_id: 1, sla: '2h',  description: 'Nenhum computador do setor financeiro está acessando a internet.'     },
    { id: 3, title: 'Impressora offline',          category_id: 1, priority: 'media',  status: 'aguardando',     user_id: 5, tech_id: null,sla: '8h', description: 'A impressora do 3º andar está aparecendo como offline.'              },
    { id: 4, title: 'E-mail não sincroniza',      category_id: 2, priority: 'baixa',  status: 'resolvido',      user_id: 6, tech_id: 2, sla: '24h', description: 'O Outlook não está sincronizando as mensagens nos últimos 2 dias.'    },
    { id: 5, title: 'Acesso ao sistema ERP negado',category_id: 4, priority: 'alta',  status: 'aberto',         user_id: 3, tech_id: null,sla: '4h', description: 'Colaborador novo não consegue acessar o sistema ERP.'               },
    { id: 6, title: 'Tela azul frequente',        category_id: 1, priority: 'critica',status: 'em_atendimento', user_id: 4, tech_id: 2, sla: '2h',  description: 'BSOD aparecendo 3-4x por dia com erro MEMORY_MANAGEMENT.'            },
    { id: 7, title: 'VPN instável',               category_id: 3, priority: 'alta',   status: 'aguardando',     user_id: 5, tech_id: 1, sla: '4h',  description: 'A VPN cai a cada 30 minutos durante trabalho remoto.'               },
    { id: 8, title: 'Office desativado',           category_id: 2, priority: 'media',  status: 'fechado',        user_id: 4, tech_id: 2, sla: '8h',  description: 'Microsoft Office exibe mensagem de licença inválida.'               },
  ])

  // ── Especialidades dos técnicos ────────────────────────────────────────
  await knex('helpdesk_tech_specialties').insert([
    { user_id: 2, category_id: 1 }, // Maria → Hardware
    { user_id: 2, category_id: 3 }, // Maria → Rede
    { user_id: 6, category_id: 2 }, // Lucia → Software
    { user_id: 6, category_id: 4 }, // Lucia → Acesso
    { user_id: 1, category_id: 3 }, // João  → Rede
    { user_id: 1, category_id: 4 }, // João  → Acesso
  ])

  // ── Comentários de exemplo ─────────────────────────────────────────────
  await knex('helpdesk_ticket_comments').insert([
    { ticket_id: 2, user_id: 1, content: 'Verificando roteador do andar. Possível falha no switch.', is_internal: true  },
    { ticket_id: 2, user_id: 4, content: 'Por favor, me atualize quando tiver uma previsão.', is_internal: false },
    { ticket_id: 4, user_id: 2, content: 'Problema resolvido. Recriamos o perfil do Outlook.', is_internal: false },
  ])
}
