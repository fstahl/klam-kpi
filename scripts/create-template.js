// Creates a fresh generic data.xlsx for Kläm KPI.
// Run: node scripts/create-template.js
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { utils, write } from 'xlsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'data.xlsx');

// ── KPIs sheet ────────────────────────────────────────────────────────────────
// Field | Type | MTD | QTD | YTD | LASTQ
// Percent fields stored as decimals (0.35 = 35%); the app multiplies ×100.
// Delta fields are the pre-computed difference vs target (positive = above).
const kpisRows = [
  ['Field',            'Type',    'MTD',    'QTD',    'YTD',    'LASTQ'  ],

  // Period labels
  ['label',            'string',  'May 2026','Q4 FY25/26','FY25/26 YTD','Q3 FY25/26'],
  ['range',            'string',  'May 2026','Mar–May 2026','Jul 2025–May 2026','Dec 2025–Feb 2026'],

  // Revenue
  ['revenue',          'number',  4200,     12800,    48500,    11200    ],
  ['revenue_delta',    'percent', 0.05,     0.03,    -0.02,    -0.08    ],
  ['revenue_target',   'number',  4000,     12400,    49500,    12200    ],

  // Gross profit
  ['gross_profit',     'number',  1470,     4480,     16975,    3584     ],
  ['gp_margin',        'percent', 0.35,     0.35,     0.35,     0.32     ],
  ['gp_margin_delta',  'percent', 0.02,     0.01,     0.03,    -0.01    ],

  // EBIT
  ['ebit',             'number',  420,      1280,     4850,     896      ],
  ['ebit_delta',       'percent', 0.12,     0.08,    -0.05,    -0.15    ],

  // People
  ['headcount',        'number',  18,       18,       18,       16       ],

  // Commercial
  ['new_customers',    'number',  2,        5,        22,       4        ],
  ['new_customers_target','number',3,       7,        25,       5        ],
  ['retention',        'percent', 0.92,     0.91,     0.90,     0.88     ],
];

// ── Sparklines sheet ──────────────────────────────────────────────────────────
// Key | Jun | Jul | Aug | Sep | Oct | Nov | Dec | Jan | Feb | Mar | Apr | May
const sparksRows = [
  ['Key', 'Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May'],
  ['revenue',    3800, 3600, 3900, 4100, 4300, 4000, 3700, 3900, 4000, 4100, 4300, 4200],
  ['gp_margin',  0.33, 0.32, 0.34, 0.35, 0.36, 0.34, 0.33, 0.34, 0.35, 0.35, 0.36, 0.35],
];

const wb = utils.book_new();
utils.book_append_sheet(wb, utils.aoa_to_sheet(kpisRows),  'KPIs');
utils.book_append_sheet(wb, utils.aoa_to_sheet(sparksRows), 'Sparklines');

writeFileSync(OUT, write(wb, { type: 'buffer', bookType: 'xlsx' }));
console.log('Created', OUT);
