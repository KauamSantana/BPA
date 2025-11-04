// src/pages/ReportForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService, Client } from '../services/clientService';
import { reportService, ReportCreate } from '../services/reportService';
import { authService, UserSimplified } from '../services/authService';
import { useToast } from '../contexts/ToastContext';
import './ReportForm.css';

function ReportForm() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<UserSimplified[]>([]);
  const [formData, setFormData] = useState({
    descricao: '',
    cliente_id: '',              // string no form; vamos converter ao enviar
    categoria: '',
    responsavel_inspecao_id: '',  // string no form para facilitar select
    data_agendada: '',           // string no formato YYYY-MM-DDTHH:mm
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClients();
    loadUsers();
  }, []);

  async function loadClients() {
    try {
      const data = await clientService.getAll();
      setClients([...data].sort((a, b) => a.nome_fantasia.localeCompare(b.nome_fantasia)));
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      toastError('Não foi possível carregar a lista de clientes.');
    }
  }

  async function loadUsers() {
    try {
      const data = await authService.getSubordinates(); // Carrega usuário atual + subordinados
      setUsers(data);
      // Define o primeiro usuário como padrão (provavelmente o próprio usuário logado)
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, responsavel_inspecao_id: String(data[0].id) }));
      }
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      toastError('Não foi possível carregar a lista de usuários.');
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.descricao.trim()) {
      toastError('A Descrição é obrigatória.');
      return;
    }
    if (!formData.cliente_id) {
      toastError('Selecione um cliente para o relatório.');
      return;
    }

    const checklistData: NonNullable<ReportCreate['categorias']> = [
      {
        nome: '1 - EDIFICAÇÃO E INSTALAÇÕES',
        ordem: 1,
        itens: [
          { codigo: '1.1.1', descricao: 'Livre de objetos em desuso ou estranhos ao ambiente e sem a presença de animais. Com acesso controlado, independente e exclusivo (não comum a outros usos como habitação, etc.).', ordem: 1 },
          { codigo: '1.2.1', descricao: 'Revestimento liso, impermeável e lavável e em adequado estado de conservação.', ordem: 2 },
          { codigo: '1.3.1', descricao: 'Ajustadas aos batentes.', ordem: 3 },
          { codigo: '1.3.2', descricao: 'Portas na área de preparação de alimentos dotadas de fechamento automático.', ordem: 4 },
          { codigo: '1.3.3', descricao: 'Janelas e outras aberturas das áreas de armazenamento e preparação de alimentos, providas de telas milimetradas e removíveis.', ordem: 5 },
          { codigo: '1.4.1', descricao: 'Separados por sexo e em quantidade suficiente.', ordem: 6 },
          { codigo: '1.4.2', descricao: 'Independentes e sem comunicação direta com a área de preparação e armazenamento de alimentos ou refeitórios.', ordem: 7 },
          { codigo: '1.4.3', descricao: 'Mantidos organizados e em adequado estado de conservação.', ordem: 8 },
          { codigo: '1.4.4', descricao: 'Portas de acesso dotadas de fechamento automático.', ordem: 9 },
          { codigo: '1.4.5', descricao: 'Instalações sanitárias com lavatórios e supridas de produtos destinados à higiene pessoal tais como papel higiênico, sabonete líquido inodoro anti-séptico e toalhas de papel não reciclado ou outro sistema higiênico e seguro para secagem das mãos.', ordem: 10 },
          { codigo: '1.4.6', descricao: 'Coletores dos resíduos dotados de tampa e acionados sem contato manual.', ordem: 11 },
          { codigo: '1.4.7', descricao: 'Instalações sanitárias para clientes atendem os mesmos requisitos descritos para funcionários.', ordem: 12 },
          { codigo: '1.5.1', descricao: 'Existência de lavatórios exclusivos para a higiene das mãos na área de manipulação com cartaz de orientação sobre a correta lavagem das mãos, dotados de torneiras com fechamento automático, sabonete líquido inodoro anti-séptico, toalhas de papel não reciclado ou outro sistema higiênico e seguro de secagem das mãos e coletor de papel acionado sem contato manual.', ordem: 13 },
          { codigo: '1.6.1', descricao: 'Iluminação da área de preparação dos alimentos proporciona a visualização e não compromete a higienização e as características sensoriais dos alimentos.', ordem: 14 },
          { codigo: '1.6.2', descricao: 'Luminárias apropriadas com sistema de proteção contra explosão e quedas acidentais em todo o estabelecimento.', ordem: 15 },
          { codigo: '1.6.3', descricao: 'Instalações elétricas embutidas ou protegidas em tubulações externas e íntegras, de tal forma a permitir a higienização dos ambientes.', ordem: 16 },
          { codigo: '1.7.1', descricao: 'Equipamentos e filtros para climatização conservados.', ordem: 17 },
          { codigo: '1.7.2', descricao: 'Apresentou registro (planilhas) da limpeza dos componentes do sistema de climatização e troca de filtros.', ordem: 18 },
          { codigo: '1.8.1', descricao: 'Garante a renovação do ar e mantém o ambiente livre de gases, fumaça, partículas em suspensão (pó, fuligem), condensação de vapores.', ordem: 19 },
          { codigo: '1.8.2', descricao: 'Não incidência do fluxo de ar diretamente sobre os alimentos de ventilador e ar condicionado.', ordem: 20 },
          { codigo: '1.9.1', descricao: 'Ausência de vetores e pragas urbanas e/ou qualquer evidência de sua presença como fezes, ninhos e outros.', ordem: 21 },
          { codigo: '1.9.2', descricao: 'Adota medidas para não atrair vetores e pragas urbanas, como o não acúmulo de lixo e restos de alimentos.', ordem: 22 },
          { codigo: '1.9.3', descricao: 'Apresentou comprovante de execução do serviço constando o prazo de validade, expedido por empresa especializada licenciada no órgão competente.', ordem: 23 },
          { codigo: '1.10.1', descricao: 'Instalações abastecidas com água corrente.', ordem: 24 },
          { codigo: '1.10.2', descricao: 'Possui laudos atestando a potabilidade da água, realizado periodicamente.', ordem: 25 },
          { codigo: '1.10.3', descricao: 'Reservatório de água edificado e ou revestido de materiais que não comprometam a qualidade da água, limpos periodicamente, conservados e devidamente tampados.', ordem: 26 },
          { codigo: '1.11.1', descricao: 'Gelo é mantido em condição higiênico-sanitária que evite sua contaminação e armazenado em local exclusivo.', ordem: 27 },
          { codigo: '1.12.1', descricao: 'O estabelecimento dispõe de lixeiras em número e capacidade suficiente, dotados de saco plástico e com tampa acionada sem contato manual.', ordem: 28 },
          { codigo: '1.12.2', descricao: 'Realiza a retirada com freqüência e estocar em local isolado das áreas de preparação e armazenamento dos alimentos.', ordem: 29 },
          { codigo: '1.13.1', descricao: 'Dispõe de conexões com rede de esgoto ou fossa séptica.', ordem: 30 },
          { codigo: '1.13.2', descricao: 'Ralos com dispositivo que permitam seu fechamento.', ordem: 31 },
          { codigo: '1.13.3', descricao: 'Caixas de gordura e esgoto localizadas fora da área de preparação, armazenamento de alimentos e limpos periodicamente.', ordem: 32 },
          { codigo: '1.14.1', descricao: 'Edificação e instalações projetadas de forma a possibilitar um fluxo ordenado e sem cruzamentos em todas as etapas da preparação de alimentos facilitando as operações de manutenção e higienização.', ordem: 33 },
        ],
      },
      {
        nome: '2 - EQUIPAMENTOS, MÓVEIS E UTENSÍLIOS',
        ordem: 2,
        itens: [
          { codigo: '2.1', descricao: 'Os que entram em contato com alimentos são de materiais que não liberam substâncias tóxicas, odores, sabores e em adequado estado de conservação.', ordem: 1 },
          { codigo: '2.2', descricao: 'Possuem superfícies lisas, impermeáveis, laváveis que não possam comprometer a higienização.', ordem: 2 },
          { codigo: '2.3', descricao: 'Os fogões, chapas, fritadeiras e similares são dotados de coifa ou outro dispositivo de exaustão.', ordem: 3 },
        ],
      },
      {
        nome: '3 - HIGIENIZAÇÃO DAS INSTALAÇÕES, EQUIPAMENTOS, MÓVEIS E UTENSÍLIOS',
        ordem: 3,
        itens: [
          { codigo: '3.1', descricao: 'Mantidos em boas condições higiênico-sanitárias.', ordem: 1 },
          { codigo: '3.2', descricao: 'Operação de higienização realizadas por funcionários comprovadamente capacitados.', ordem: 2 },
          { codigo: '3.3', descricao: 'Produtos de higienização e material de limpeza identificados e guardados em local reservado para essa finalidade.', ordem: 3 },
          { codigo: '3.4', descricao: 'Materiais utilizados para higienização das instalações são distintos dos utilizados para higienização dos equipamentos, móveis e utensílios.', ordem: 4 },
        ],
      },
      {
        nome: '4 - MANIPULADORES',
        ordem: 4,
        itens: [
          { codigo: '4.1.1', descricao: 'Utilizam uniformes compatíveis com a atividade. Estão conservados, limpos, com uso exclusivo nas dependências internas e trocados no mínimo diariamente.', ordem: 1 },
          { codigo: '4.1.2', descricao: 'As roupas e objetos pessoais estão guardados em local específico (vestiário).', ordem: 2 },
          { codigo: '4.1.3', descricao: 'Asseio pessoal: mãos limpas, unhas curtas, sem esmalte, sem adornos (anéis, pulseiras, brincos, etc.) e maquiagem. Cabelos presos e protegidos por redes, toucas ou outro acessório apropriado para esse fim, não sendo permitido o uso de barba.', ordem: 3 },
          { codigo: '4.2.1', descricao: 'Manipuladores possuem Atestado de Saúde Ocupacional (ASO).', ordem: 4 },
          { codigo: '4.2.2', descricao: 'Manipuladores que apresentam lesões e ou sintomas de enfermidades que possam comprometer a qualidade higiênico-sanitária dos alimentos estão afastados da atividade de preparação de alimentos.', ordem: 5 },
          { codigo: '4.3.1', descricao: 'Existência de capacitação periódica em higiene pessoal, manipulação higiênica de alimentos e em doenças transmitidas por alimentos.', ordem: 6 },
          { codigo: '4.3.2', descricao: 'Possuem registros dessas capacitações, contendo no mínimo (conteúdo programático, data, período, número de funcionários participantes).', ordem: 7 },
        ],
      },
      {
        nome: '5 - MATÉRIAS-PRIMAS',
        ordem: 5,
        itens: [
          { codigo: '5.1.1', descricao: 'Embalagens primárias das matérias-primas e dos ingredientes íntegros.', ordem: 1 },
          { codigo: '5.1.2', descricao: 'Matérias-primas armazenadas em local limpo e organizado, sobre paletes, estrados e ou prateleiras de material liso, resistente, impermeável e lavável.', ordem: 2 },
        ],
      },
      {
        nome: '6 - PREPARAÇÃO DO ALIMENTO',
        ordem: 6,
        itens: [
          { codigo: '6.1.1', descricao: 'Na preparação dos alimentos são adotadas medidas para minimizar o risco de contaminação cruzada.', ordem: 1 },
          { codigo: '6.1.2', descricao: 'Não há contato entre alimentos crus e prontos para o consumo.', ordem: 2 },
          { codigo: '6.1.3', descricao: 'Funcionários que manipulam alimentos crus realizam a lavagem e a anti-sépsia das mãos antes de manusear alimentos preparados e entre uma atividade e outra.', ordem: 3 },
          { codigo: '6.1.4', descricao: 'Produtos perecíveis expostos à temperatura ambiente somente pelo tempo mínimo necessário para a preparação do alimento.', ordem: 4 },
          { codigo: '6.2.1', descricao: 'Os alimentos retirados da embalagem original estão acondicionados em sacos, potes plásticos, vidro com tampa e identificados com nome do produto, data de fracionamento e prazo de validade.', ordem: 5 },
          { codigo: '6.3.1', descricao: 'Aquecidos a temperaturas não superiores a 180ºC (cento e oitenta graus Celsius).', ordem: 6 },
          { codigo: '6.3.2', descricao: 'Substituídos imediatamente sempre que há alteração evidente do aroma, do sabor e da formação intensa de espuma e fumaça.', ordem: 7 },
          { codigo: '6.4.1', descricao: 'Descongelamento realizado em condições de refrigeração à temperatura inferior a 4ºC (quatro graus Celsius) ou em forno de microondas.', ordem: 8 },
          { codigo: '6.4.2', descricao: 'Alimentos descongelados estão mantidos sob refrigeração e não são novamente recongelados.', ordem: 9 },
          { codigo: '6.5.1', descricao: 'Os alimentos preparados a quente devem ser conservados à temperatura superior a 60ºC (sessenta graus Celsius) por, no máximo, 6 (seis) horas.', ordem: 10 },
          { codigo: '6.6.1', descricao: 'No resfriamento a temperatura do alimento é reduzida de 60ºC (sessenta graus Celsius) a 10ºC (dez graus Celsius) em até duas horas.', ordem: 11 },
          { codigo: '6.6.2', descricao: 'O alimento preparado é resfriado antes da conservação sob refrigeração ou congelamento.', ordem: 12 },
          { codigo: '6.7.1', descricao: 'Sob refrigeração o alimento está conservado a temperatura igual ou inferior a 4ºC (quatro graus Celsius), e congelado à temperatura igual ou inferior a -18ºC (dezoito graus Celsius negativos).', ordem: 13 },
          { codigo: '6.7.2', descricao: 'Alimentos preparados são consumidos no prazo máximo de 5 (cinco) dias e conservado sob refrigeração, identificados com: nome do produto, data de preparo e prazo de validade.', ordem: 14 },
          { codigo: '6.8.1', descricao: 'Para alimentos consumidos crus é realizado a higienização (lavagem e desinfecção).', ordem: 15 },
          { codigo: '6.8.2', descricao: 'Produtos utilizados na higienização dos alimentos regularizados junto a ANVISA/MS.', ordem: 16 },
          { codigo: '6.9.1', descricao: 'O estabelecimento possui um responsável capacitado pela atividade de manipulação.', ordem: 17 },
          { codigo: '6.9.2', descricao: 'O responsável pelas atividades de manipulação dos alimentos possui comprovante de curso de capacitação de alimentos, abordando, no mínimo, os seguintes temas: Contaminantes alimentares, Doenças transmitidas por alimentos, Manipulação higiênica dos alimentos e Boas Práticas.', ordem: 18 },
        ],
      },
      {
        nome: '7 - TRANSPORTE',
        ordem: 7,
        itens: [
          { codigo: '7.1.1', descricao: 'Armazenamento, transporte e consumo do alimento preparado ocorrem em condições de tempo e temperatura que não comprometam sua qualidade higiênico-sanitária.', ordem: 1 },
          { codigo: '7.1.2', descricao: 'A temperatura do alimento preparado é monitorada durante as etapas de armazenamento, transporte e exposição para consumo quando aplicável.', ordem: 2 },
          { codigo: '7.1.3', descricao: 'Veículos dotados de cobertura para proteção da carga, exclusivo para alimentos.', ordem: 3 },
          { codigo: '7.1.4', descricao: 'Possui registro desse monitoramento.', ordem: 4 },
          { codigo: '7.1.5', descricao: 'Veículos licenciados pelo órgão competente.', ordem: 5 },
        ],
      },
      {
        nome: '8 - EXPOSIÇÃO AO CONSUMO',
        ordem: 8,
        itens: [
          { codigo: '8.1.1', descricao: 'Mantida organizada e limpa.', ordem: 1 },
          { codigo: '8.1.2', descricao: 'Equipamentos, móveis e utensílios disponíveis nessa área compatíveis com as atividades, em número suficiente e em bom estado de conservação.', ordem: 2 },
          { codigo: '8.1.3', descricao: 'Manipuladores realizam anti-sepsia das mãos e uso de utensílios ou luvas descartáveis, para tocar os alimentos.', ordem: 3 },
          { codigo: '8.2.1', descricao: 'Equipamento de exposição devidamente dimensionado, limpo, conservado e com dispositivo de medição de temperatura.', ordem: 4 },
          { codigo: '8.2.2', descricao: 'Equipamento de exposição do alimento preparado, na área para consumo, dispõe de barreiras de proteção que previnam a contaminação em decorrência da proximidade ou da ação do consumidor e de outras fontes.', ordem: 5 },
          { codigo: '8.2.3', descricao: 'Existência próximo ao equipamento de exposição do alimento preparado de: 1- Lavatório exclusivo para os clientes com cartaz de orientação sobre a correta lavagem das mãos, dotados de torneiras com fechamento automático, sabonete líquido inodoro anti-séptico, álcool gel a 70°, toalhas de papel não reciclado ou outro sistema higiênico e seguro de secagem das mãos e coletor de papel acionado sem contato manual. 2- Ou álcool gel a 70°.', ordem: 6 },
          { codigo: '8.2.4', descricao: 'Existência de cartaz de orientação ao consumidor, no início do equipamento de exposição dos alimentos, com o dizer: "PARA SEGURANÇA DE SUA SAÚDE E DE TERCEIROS NÃO FALE ENQUANTO ESTIVER SE SERVINDO".', ordem: 7 },
          { codigo: '8.3.1', descricao: 'Utensílios utilizados: pratos, copos, talheres, descartáveis, quando feitos de material não-descartável, devidamente higienizados e armazenados em local protegido.', ordem: 8 },
          { codigo: '8.4.1', descricao: 'Se localizados na área de consumo, ou refeitório não constituem fonte de contaminação para os alimentos preparados.', ordem: 9 },
          { codigo: '8.5.1', descricao: 'Área de recebimento de dinheiro, cartões e outros meios utilizados para o pagamento de despesas é reservada e com funcionário exclusivo para esta atividade.', ordem: 10 },
        ],
      },
      {
        nome: '9 - AMOSTRA DE ALIMENTOS',
        ordem: 9,
        itens: [
          { codigo: '9.1.1', descricao: 'O estabelecimento guarda uma amostra de 75 a 100g (setenta e cinco a cem gramas) de cada alimento preparado sob refrigeração, armazenado em recipiente descartável de primeiro uso, por no mínimo 72 (setenta e duas) horas para ser entregue a autoridade sanitária quando solicitado em caso de Doenças Transmitidas por Alimentos, contendo as seguintes informações: nome do produto, data de preparo, data que foi servido o alimento e refeição (almoço, janta, etc).', ordem: 1 },
        ],
      },
      {
        nome: '10 - DOCUMENTAÇÃO E REGISTRO',
        ordem: 10,
        itens: [
          { codigo: '10.1.1', descricao: 'Dispõe de Manual de Boas Práticas e de Procedimentos Operacionais Padronizados.', ordem: 1 },
          { codigo: '10.1.2', descricao: 'Esses documentos estão acessíveis aos funcionários envolvidos e disponíveis à Autoridade Sanitária, quando requisitado.', ordem: 2 },
          { codigo: '10.2.1.1', descricao: 'Existência de POP estabelecido para Higienização das instalações, equipamentos, móveis e utensílios.', ordem: 3 },
          { codigo: '10.2.1.2', descricao: 'POP descrito, sendo cumprido.', ordem: 4 },
          { codigo: '10.2.2.1', descricao: 'Existência de POP estabelecido para Controle integrado de vetores e pragas urbanas.', ordem: 5 },
          { codigo: '10.2.2.2', descricao: 'POP descrito, sendo cumprido.', ordem: 6 },
          { codigo: '10.2.3.1', descricao: 'Existência de POP estabelecido para Higienização do reservatório.', ordem: 7 },
          { codigo: '10.2.3.2', descricao: 'POP descrito, sendo cumprido.', ordem: 8 },
          { codigo: '10.2.4.1', descricao: 'Existência de POP estabelecido para Higiene e saúde dos manipuladores.', ordem: 9 },
          { codigo: '10.2.4.2', descricao: 'POP descrito, sendo cumprido.', ordem: 10 },
        ],
      },
    ];

    if (!formData.responsavel_inspecao_id) {
      toastError('Selecione um responsável pela inspeção.');
      return;
    }

    const payload: ReportCreate = {
      descricao: formData.descricao.trim(),
      cliente_id: parseInt(formData.cliente_id, 10),         
      categoria: formData.categoria.trim() || undefined,
      responsavel_inspecao_id: parseInt(formData.responsavel_inspecao_id, 10),
      data_agendada: formData.data_agendada || undefined,
      categorias: checklistData,
    };

    try {
      setLoading(true);
      const created = await reportService.create(payload);

      if (!created || typeof created.id !== 'number') {
        toastError('O servidor não retornou o ID do relatório.');
        return;
      }

      success('Relatório criado com sucesso!');
      navigate(`/reports/checklist/${created.id}`);
    } catch (err: any) {
      console.error('Erro ao criar relatório:', err);
      const detail =
        err?.response?.data?.detail ??
        err?.message ??
        'Erro ao criar relatório. Verifique os campos e tente novamente.';
      toastError(typeof detail === 'string' ? detail : 'Erro ao criar relatório.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="report-form-page">
      <div className="report-form-container">
        <div className="report-form-header">
         <button
          onClick={() => navigate('/reports')}
          className="btn btn-secondary btn-back"
          type="button">
            ← Voltar para Relatórios
         </button>
          <h1>Cadastro de Relatórios</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="descricao">Descrição: *</label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
              placeholder="Ex: Relatório de Verificação das Boas Práticas"
              rows={3}
            />
          </div>

          <div className="form-grid-2">
            <div className="input-group">
              <label htmlFor="cliente_id">Cliente: *</label>
              <select
                id="cliente_id"
                name="cliente_id"
                value={formData.cliente_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecione um cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome_fantasia}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="categoria">Categoria:</label>
              <input
                id="categoria"
                type="text"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                placeholder="Ex: Inspeção Sanitária"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="input-group">
              <label htmlFor="responsavel_inspecao_id">Responsável pela Inspeção: *</label>
              <select
                id="responsavel_inspecao_id"
                name="responsavel_inspecao_id"
                value={formData.responsavel_inspecao_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecione um responsável</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.nome} ({user.role === 'admin' ? 'Administrador' : user.role === 'chefe' ? 'Chefe' : 'Operador'})
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="data_agendada">Data Agendada:</label>
              <input
                id="data_agendada"
                type="datetime-local"
                name="data_agendada"
                value={formData.data_agendada}
                onChange={handleChange}
                placeholder="Selecione data e hora"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="btn btn-secondary"
            >
              VOLTAR
            </button>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Criando...' : 'INICIAR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportForm;
