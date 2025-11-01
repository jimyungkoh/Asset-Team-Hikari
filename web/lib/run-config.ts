// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-28
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

export type AnalystIdentifier = 'market' | 'social' | 'news' | 'fundamentals';

export interface AnalystOption {
  id: AnalystIdentifier;
  name: string;
  description: string;
}

export interface ResearchDepthOption {
  id: 'shallow' | 'medium' | 'deep';
  label: string;
  rounds: number;
  summary: string;
}

export interface ModelOption {
  value: string;
  label: string;
  hint?: string;
}

interface ProviderBase {
  id: 'openai' | 'openrouter' | 'local';
  display: string;
  backendUrl: string;
  description: string;
  quickModels: ModelOption[];
  deepModels: ModelOption[];
  defaultQuickModel?: string;
  defaultDeepModel?: string;
}

export interface ThinkingSettings {
  enableThinkingMode: boolean;
  thinkingEffort: 'light' | 'medium' | 'heavy';
  thinkingEffortQuick: 'light' | 'medium' | 'heavy';
  thinkingEffortDeep: 'light' | 'medium' | 'heavy';
}

export interface ProviderOption extends ProviderBase {
  defaultThinking?: ThinkingSettings;
}

export interface RunDraft {
  ticker: string;
  tradeDate: string;
  analysts: AnalystIdentifier[];
  researchDepth: ResearchDepthOption;
  provider: ProviderOption;
  quickModel: string;
  deepModel: string;
  thinking?: ThinkingSettings;
}

export interface RunRequestPayload {
  ticker: string;
  tradeDate: string;
  config: Record<string, unknown>;
}

export const ANALYST_OPTIONS: AnalystOption[] = [
  {
    id: 'market',
    name: '시장 분석가',
    description: '시장 구조와 가격 움직임을 점검합니다.',
  },
  {
    id: 'social',
    name: '소셜 분석가',
    description: '소셜 미디어 데이터로 투자 심리를 파악합니다.',
  },
  {
    id: 'news',
    name: '뉴스 분석가',
    description: '뉴스 헤드라인과 리포트를 모니터링합니다.',
  },
  {
    id: 'fundamentals',
    name: '펀더멘털 분석가',
    description: '재무제표 기반의 내재 가치 평가를 수행합니다.',
  },
];

export const RESEARCH_DEPTH_OPTIONS: ResearchDepthOption[] = [
  {
    id: 'shallow',
    label: '빠른 분석',
    rounds: 1,
    summary: '빠른 스캔과 1회의 검토로 가볍게 훑어봅니다.',
  },
  {
    id: 'medium',
    label: '표준 분석',
    rounds: 3,
    summary: '표준 시나리오로 3회 내외의 검토와 검증을 수행합니다.',
  },
  {
    id: 'deep',
    label: '심층 분석',
    rounds: 5,
    summary: '심층 리서치로 최대 5회 검토를 통해 리스크를 정교하게 분석합니다.',
  },
];

const OPENAI_QUICK: ModelOption[] = [
  { value: 'gpt-4o-mini', label: 'GPT-4o mini', hint: '빠른 초기 분석' },
  { value: 'gpt-4.1-mini', label: 'GPT-4.1 mini', hint: '차트와 텍스트 통합 분석' },
  { value: 'o4-mini', label: 'o4 mini', hint: '경량 추론 엔진' },
];

const OPENAI_DEEP: ModelOption[] = [
  { value: 'o4-mini', label: 'o4 mini', hint: '합리적인 비용의 심층 분석' },
  { value: 'gpt-4o', label: 'GPT-4o', hint: '정밀하고 완성도 높은 리서치' },
  { value: 'o3', label: 'o3', hint: '최고급 장기 분석' },
];

const OPENROUTER_QUICK: ModelOption[] = [
  {
    value: 'x-ai/grok-4-fast',
    label: 'xAI: Grok-4 Fast',
    hint: '초고속 응답, 초기 검토',
  },
  {
    value: 'deepseek/deepseek-v3.1-terminus',
    label: 'DeepSeek: DeepSeek-V3.1-Terminus',
    hint: '고정밀 검토, 빠른 결론 도출',
  },
  {
    value: 'deepseek/deepseek-v3.2-exp',
    label: 'DeepSeek: DeepSeek-V3.2-Exp',
    hint: '기본 빠른 분석 (실험 버전)',
  },
];

const OPENROUTER_DEEP: ModelOption[] = [
  {
    value: 'deepseek/deepseek-v3.1-terminus',
    label: 'DeepSeek: DeepSeek-V3.1-Terminus',
    hint: '안정적 검토, 리스크 점검 특화',
  },
  {
    value: 'deepseek/deepseek-r1-0528',
    label: 'DeepSeek: DeepSeek-R1-0528',
    hint: '기본 심층 분석, 장기 검토 강화',
  },
  {
    value: 'deepseek/deepseek-v3.2-exp',
    label: 'DeepSeek: DeepSeek-V3.2-Exp',
    hint: '실험형 장기 분석, 복잡한 시나리오',
  },
];

const LOCAL_QUICK: ModelOption[] = [
  { value: 'llama3.1', label: 'Llama 3.1 (8B)', hint: '자체 서버 기본 설정' },
  { value: 'qwen2.5:7b', label: 'Qwen 2.5 (7B)', hint: '저비용 대안' },
  { value: 'mistral:7b-instruct', label: 'Mistral 7B Instruct', hint: '맞춤 설정 가능' },
];

const LOCAL_DEEP: ModelOption[] = [
  { value: 'llama3.1:70b', label: 'Llama 3.1 (70B)', hint: '심층 분석용 대용량 엔진' },
  { value: 'mixtral:8x7b', label: 'Mixtral 8x7B', hint: '고속 분석 특화' },
  { value: 'qwen2.5:14b', label: 'Qwen 2.5 (14B)', hint: '다국어 최적화' },
];

export const PROVIDER_OPTIONS: ProviderOption[] = [
  {
    id: 'openai',
    display: 'OpenAI',
    backendUrl: 'https://api.openai.com/v1',
    description: '금융 리서치에 최적화된 OpenAI AI 서비스입니다.',
    quickModels: OPENAI_QUICK,
    deepModels: OPENAI_DEEP,
  },
  {
    id: 'openrouter',
    display: 'OpenRouter',
    backendUrl: 'https://openrouter.ai/api/v1',
    description: '다양한 AI 엔진을 선택할 수 있는 통합 서비스입니다.',
    quickModels: OPENROUTER_QUICK,
    deepModels: OPENROUTER_DEEP,
    defaultQuickModel: 'deepseek/deepseek-v3.2-exp',
    defaultDeepModel: 'deepseek/deepseek-r1-0528',
    defaultThinking: {
      enableThinkingMode: true,
      thinkingEffort: 'heavy',
      thinkingEffortQuick: 'heavy',
      thinkingEffortDeep: 'heavy',
    },
  },
  {
    id: 'local',
    display: '자체 서버',
    backendUrl: 'http://localhost:11434/v1',
    description: '사내 인프라 또는 테스트용 자체 서버에 연결합니다.',
    quickModels: LOCAL_QUICK,
    deepModels: LOCAL_DEEP,
  },
];

export function getProviderById(providerId: ProviderOption['id']): ProviderOption {
  const provider = PROVIDER_OPTIONS.find((option) => option.id === providerId);
  if (!provider) {
    return PROVIDER_OPTIONS[0];
  }
  return provider;
}

export function buildRunRequest(
  draft: RunDraft,
  overrides?: Record<string, unknown>,
): RunRequestPayload {
  const configOverrides: Record<string, unknown> = {
    llm_provider: draft.provider.id,
    backend_url: draft.provider.backendUrl,
    quick_think_llm: draft.quickModel,
    deep_think_llm: draft.deepModel,
    max_debate_rounds: draft.researchDepth.rounds,
    max_risk_discuss_rounds: draft.researchDepth.rounds,
    selected_analysts: draft.analysts,
    metadata: {
      analysts: draft.analysts,
      researchDepth: {
        id: draft.researchDepth.id,
        label: draft.researchDepth.label,
        rounds: draft.researchDepth.rounds,
      },
      llmProvider: draft.provider.display,
      quickModel: draft.quickModel,
      deepModel: draft.deepModel,
      preparedAt: new Date().toISOString(),
    },
  };

  const thinkingConfig = draft.thinking ?? draft.provider.defaultThinking;
  if (thinkingConfig) {
    configOverrides.enable_thinking_mode = thinkingConfig.enableThinkingMode;
    configOverrides.thinking_effort = thinkingConfig.thinkingEffort;
    configOverrides.thinking_effort_quick = thinkingConfig.thinkingEffortQuick;
    configOverrides.thinking_effort_deep = thinkingConfig.thinkingEffortDeep;
  }

  if (overrides) {
    Object.assign(configOverrides, overrides);
  }

  return {
    ticker: draft.ticker,
    tradeDate: draft.tradeDate,
    config: configOverrides,
  };
}
