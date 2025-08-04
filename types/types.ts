export interface OrganizationData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  contratoAno: string;
  statusCT: string;
  uf: string;
  cidade: string;
  endereco: string;
  telefone: string;
  email: string;
  vagasContratadas: number;
  adultoMasc: number;
  adultoFeminino: number;
  maes: number;
  previsaoRecursoAnual: number;
  previsaoRecursoMensal: number;
  dataInicialCT: string;
  dataVencimentoCT: string;
  dataCronologica?: string;
  municipio?: string;
  statusCertificacao?: string;
  dtInicioCertificacaoAtual?: string;
  dtFimCertificacaoAtual?: string;
  tipoInstrumento: string;
  proponente: string;
  gnd: string;
  gnd3: string;
  gnd4?: string;
  contrapartida?: string;
  valorTotalGlobal: number;
}

export type FilterCondition = 
  | { field: keyof OrganizationData; operator: 'equals'; value: string | number }
  | { field: keyof OrganizationData; operator: 'contains'; value: string }
  | { field: keyof OrganizationData; operator: 'greaterThan'; value: number }
  | { field: keyof OrganizationData; operator: 'lessThan'; value: number };

export interface FilterOptions {
  conditions: FilterCondition[];
  sortBy?: {
    field: keyof OrganizationData;
    direction: 'asc' | 'desc';
  };
}