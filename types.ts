// Enums for Slide Types
export enum SlideLayout {
  TITLE = 'TITLE',
  BULLET_POINTS = 'BULLET_POINTS',
  TWO_COLUMN = 'TWO_COLUMN',
  CHART_BAR = 'CHART_BAR',
  CHART_LINE = 'CHART_LINE',
  KPI_GRID = 'KPI_GRID'
}

// Data structures for Charts
export interface ChartPoint {
  label: string;
  value: number;
  value2?: number; // For comparison
}

// Slide Interface
export interface Slide {
  id: string;
  layout: SlideLayout;
  tracker: string; // The "breadcrumb" at top right
  actionTitle: string; // Full sentence headline
  kicker: string; // Small context tag above title
  content: {
    bullets?: string[];
    leftColumn?: string[];
    rightColumn?: string[];
    chartData?: ChartPoint[];
    chartTitle?: string;
    chartXLabel?: string;
    chartYLabel?: string;
    kpiData?: { label: string; value: string; delta: string }[];
  };
  speakerNotes: string;
}

export interface Deck {
  title: string;
  subtitle: string;
  author: string;
  slides: Slide[];
}

export interface FileInput {
  name: string;
  type: string;
  data: string; // Base64
}

export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export enum AppMode {
  DECK = 'DECK',
  INFOGRAPHIC = 'INFOGRAPHIC'
}
