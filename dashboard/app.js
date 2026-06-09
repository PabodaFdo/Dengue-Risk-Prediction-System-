/* ====================================================
   DENGUE INTELLIGENCE DASHBOARD — APP.JS
   Sri Lanka Dengue Risk Prediction System
   ==================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ==============================
     DATA
     ============================== */

  const DISTRICTS = [
    {
      name: 'Colombo',    province: 'Western',       risk: 'high',
      cases: 312,         rainfall: '89 mm',          temp: '29.8°C',
      trend: 'up',        trendLabel: '↑ 12% this week',
      reason: 'High population density combined with recent heavy rainfall is increasing mosquito breeding sites.'
    },
    {
      name: 'Gampaha',    province: 'Western',        risk: 'high',
      cases: 246,         rainfall: '76 mm',           temp: '29.3°C',
      trend: 'up',        trendLabel: '↑ 8% this week',
      reason: 'Urbanised suburban zones with blocked drainage contributing to stagnant water accumulation.'
    },
    {
      name: 'Kandy',      province: 'Central',        risk: 'medium',
      cases: 134,         rainfall: '62 mm',           temp: '26.5°C',
      trend: 'flat',      trendLabel: '→ Stable',
      reason: 'Moderate rainfall patterns and hill-country climate creating moderate breeding conditions.'
    },
    {
      name: 'Galle',      province: 'Southern',       risk: 'medium',
      cases: 98,          rainfall: '54 mm',           temp: '28.1°C',
      trend: 'up',        trendLabel: '↑ 5% this week',
      reason: 'Monsoon season onset increasing precipitation near coastal areas.'
    },
    {
      name: 'Kurunegala',  province: 'North Western', risk: 'medium',
      cases: 112,         rainfall: '58 mm',           temp: '30.2°C',
      trend: 'flat',      trendLabel: '→ Stable',
      reason: 'Warm temperatures and scattered rainfall creating occasional high-risk pockets.'
    },
    {
      name: 'Jaffna',     province: 'Northern',       risk: 'low',
      cases: 42,          rainfall: '18 mm',           temp: '32.4°C',
      trend: 'down',      trendLabel: '↓ 3% reduction',
      reason: 'Dry conditions with low rainfall limiting mosquito breeding sites significantly.'
    },
    {
      name: 'Kalutara',   province: 'Western',        risk: 'high',
      cases: 178,         rainfall: '95 mm',           temp: '28.9°C',
      trend: 'up',        trendLabel: '↑ 15% this week',
      reason: 'Extremely high rainfall pattern and low-lying terrain causing severe water pooling.'
    },
    {
      name: 'Batticaloa', province: 'Eastern',        risk: 'medium',
      cases: 87,          rainfall: '47 mm',           temp: '30.8°C',
      trend: 'flat',      trendLabel: '→ Stable',
      reason: 'Moderate case load with manageable rainfall. Monitor drainage systems.'
    },
    {
      name: 'Ratnapura',  province: 'Sabaragamuwa',   risk: 'high',
      cases: 154,         rainfall: '112 mm',          temp: '27.3°C',
      trend: 'up',        trendLabel: '↑ 18% this week',
      reason: 'Extremely high rainfall in Wet Zone leading to extensive standing water formation.'
    },
    {
      name: 'Matara',     province: 'Southern',       risk: 'low',
      cases: 54,          rainfall: '32 mm',           temp: '28.5°C',
      trend: 'down',      trendLabel: '↓ 6% reduction',
      reason: 'Active community intervention programs have reduced breeding sites effectively.'
    },
    {
      name: 'Anuradhapura', province: 'North Central', risk: 'low',
      cases: 38,           rainfall: '22 mm',           temp: '33.1°C',
      trend: 'down',       trendLabel: '↓ Decreasing',
      reason: 'Dry zone climate with low humidity reduces mosquito vector lifespan.'
    },
    {
      name: 'Badulla',    province: 'Uva',            risk: 'low',
      cases: 29,          rainfall: '28 mm',           temp: '22.4°C',
      trend: 'flat',      trendLabel: '→ Stable',
      reason: 'High elevation and cooler temperatures naturally suppress mosquito activity.'
    },
    {
      name: 'Polonnaruwa', province: 'North Central',  risk: 'low',
      cases: 31,           rainfall: '19 mm',           temp: '31.6°C',
      trend: 'flat',       trendLabel: '→ Stable',
      reason: 'Low rainfall and dry zone conditions limiting breeding site formation.'
    },
    {
      name: 'Hambantota', province: 'Southern',       risk: 'low',
      cases: 22,          rainfall: '14 mm',           temp: '30.5°C',
      trend: 'down',      trendLabel: '↓ Improving',
      reason: 'Very low rainfall in dry zone keeps mosquito populations well below risk threshold.'
    },
    {
      name: 'Monaragala', province: 'Uva',            risk: 'low',
      cases: 18,          rainfall: '12 mm',           temp: '29.8°C',
      trend: 'down',      trendLabel: '↓ Improving',
      reason: 'Sparse population and dry conditions result in very low dengue transmission risk.'
    }
  ];

  const PIPELINE_STEPS = [
    {
      num: '01', title: 'Raw Dengue Case Data',
      subtitle: 'Source data collection',
      badge: 'Input',
      desc: 'Weekly dengue case data extracted from public health PDF reports published by the National Dengue Control Unit (Ministry of Health, Sri Lanka) covering all 25 districts from 2022 to 2025.',
      ops: [
        'Automated PDF parsing using pdfplumber and regular expressions',
        'Pattern matching for 25 Sri Lankan district names with case counts',
        'ISO calendar-based temporal indexing (Monday start dates)',
        'Handling "Nil" entries as zero-case weeks'
      ],
      code: `import pdfplumber, re\n\npattern = re.compile(\n  rf"({'|'.join(districts)})\\s+(\\d+|Nil)"\n)\nwith pdfplumber.open(pdf_path) as pdf:\n  for page in pdf.pages:\n    text = page.extract_text()\n    # Clean & extract numerical cases`
    },
    {
      num: '02', title: 'Weather Data Integration',
      subtitle: 'Open-Meteo API fusion',
      badge: 'Merge',
      desc: 'Meteorological data fetched from the Open-Meteo API for each district centroid coordinates, providing 6+ weather variables on a weekly aggregated basis to complement clinical dengue case data.',
      ops: [
        'Temperature (mean, max, min °C) weekly aggregation',
        'Precipitation sum (mm), sunshine and daylight duration (hours)',
        'Wind speed maximum (km/h) and evapotranspiration FAO index',
        'District-centroid coordinate mapping for API calls'
      ],
      code: `import openmeteo_requests\n\nparams = {\n  "latitude": district_lat,\n  "longitude": district_lon,\n  "weekly": ["temperature_2m_mean",\n             "precipitation_sum",\n             "sunshine_duration"],\n  "start_date": "2022-01-01"\n}`
    },
    {
      num: '03', title: 'Data Cleaning & Imputation',
      subtitle: 'Missing value handling & validation',
      badge: 'Clean',
      desc: 'Systematic data cleaning to address missing values, type inconsistencies, and data quality issues. Sequential forward-fill followed by backward interpolation ensures continuity without introducing artificial signals.',
      ops: [
        'Missing rate analysis: ~4.2% across weather API streams',
        'Sequential forward-fill for evaporation and wind speed gaps',
        'Backward interpolation as fallback for leading missing values',
        'Type validation and date format standardisation'
      ],
      code: `# Forward fill then backward fill\ndf = df.sort_values(['District', 'week_start'])\ndf = df.groupby('District').apply(\n  lambda g: g.fillna(method='ffill')\n               .fillna(method='bfill')\n).reset_index(drop=True)`
    },
    {
      num: '04', title: 'Weekly Aggregation',
      subtitle: 'Temporal data alignment',
      badge: 'Aggregate',
      desc: 'Aligning daily meteorological data to weekly dengue case reporting cycles. All weather variables are aggregated to ISO week numbers to match the frequency of clinical dengue reports.',
      ops: [
        'ISO week-based grouping for consistent temporal alignment',
        'Aggregation functions: mean for temperature, sum for rainfall',
        'District-week composite key creation for merge operations',
        'Validation of row counts per district per year'
      ],
      code: `# Aggregate to weekly level\ndf['iso_week'] = pd.to_datetime(\n  df['date']\n).dt.isocalendar().week\n\nweekly = df.groupby(\n  ['District','year','iso_week']\n).agg({\n  'precipitation_sum': 'sum',\n  'temperature_2m_mean': 'mean'\n}).reset_index()`
    },
    {
      num: '05', title: 'Outlier Capping (Winsorization)',
      subtitle: 'Extreme value stabilisation',
      badge: 'Preprocess',
      desc: 'Robust Winsorization approach caps extreme meteorological values at the 1st and 99th percentiles rather than removing them. This preserves the signal of extreme weather events while preventing leverage points from skewing model weights.',
      ops: [
        'Percentile thresholds: 1st (lower) and 99th (upper) per variable',
        'Applied to: temperature (mean, max, min), rainfall, wind speed, evapotranspiration',
        'clip() used instead of deletion to retain all observations',
        'Pre/post visualisation for quality validation'
      ],
      code: `# Winsorize each weather column\nfor col in weather_cols:\n  q_low  = df[col].quantile(0.01)\n  q_high = df[col].quantile(0.99)\n  df[col] = df[col].clip(\n    lower=q_low, upper=q_high\n  )`
    },
    {
      num: '06', title: 'Feature Engineering & Lags',
      subtitle: 'Temporal predictors creation',
      badge: 'Engineer',
      desc: 'Constructing high-impact temporal features that capture the biological lag between weather conditions and dengue transmission. Mosquito breeding cycles typically lag weather events by 2–4 weeks.',
      ops: [
        'Lag features: rainfall and temperature at 2, 3, 4-week delays',
        'Daylight-to-sunshine duration ratio as cloud cover proxy',
        'District-specific 4-week rolling case average',
        'Week-of-year cyclical encoding (sin/cos transforms)'
      ],
      code: `# Lagged predictors for breeding delay\ndf['temp_lag_2'] = df.groupby(\n  'District'\n)['temp_mean'].shift(2)\n\ndf['rain_lag_4'] = df.groupby(\n  'District'\n)['precipitation_sum'].shift(4)\n\ndf['sunshine_daylight_ratio'] = (\n  df['sunshine_duration'] /\n  df['daylight_duration']\n)`
    },
    {
      num: '07', title: 'District Target Encoding',
      subtitle: 'Categorical feature conversion',
      badge: 'Encode',
      desc: 'Converting the categorical district variable to numerical form using target encoding — mapping each district to its mean historical risk level. This avoids the high-cardinality issues of one-hot encoding with 25 categories.',
      ops: [
        'Mean target encoding: district → mean(risk_level)',
        'Prevents dummy variable trap with 25-category one-hot',
        'Train/test split performed before encoding to prevent leakage',
        'Spatial indices added to enrich geographic context'
      ],
      code: `# Target encoding for districts\nmean_risk = df.groupby(\n  'District'\n)['risk_level'].mean()\n\ndf['District_encoded'] = (\n  df['District'].map(mean_risk)\n)`
    },
    {
      num: '08', title: 'Standard Scaling',
      subtitle: 'Feature normalisation to z-scores',
      badge: 'Scale',
      desc: 'StandardScaler normalises all continuous weather predictors to zero mean and unit variance. Essential for PCA (which is variance-based) and any distance-based classifiers, preventing high-magnitude features from dominating.',
      ops: [
        'Formula: z = (x - μ) / σ — zero-centred unit variance',
        'Applied to all continuous weather variables after lag engineering',
        'Scaler fitted on training data only, applied to test set',
        'Ensures PCA captures genuine variance, not scale differences'
      ],
      code: `from sklearn.preprocessing import StandardScaler\n\nscaler = StandardScaler()\ncols_to_scale = [\n  'precipitation_sum', 'temp_mean_C',\n  'sunshine_duration', 'wind_speed_max',\n  'rain_lag_4', 'temp_lag_2'\n]\nX_train[cols_to_scale] = scaler.fit_transform(\n  X_train[cols_to_scale]\n)\nX_test[cols_to_scale] = scaler.transform(\n  X_test[cols_to_scale]\n)`
    },
    {
      num: '09', title: 'PCA Dimensionality Reduction',
      subtitle: 'Principal Component Analysis',
      badge: 'Reduce',
      desc: 'PCA resolves multicollinearity among the correlated weather features (e.g., sunshine duration and daylight duration have r=0.87). 7 principal components preserve >90% of the total weather variance while significantly reducing input dimensions.',
      ops: [
        '7 PCs extracted, capturing 92.4% of cumulative explained variance',
        'PC1 alone accounts for ~34% — primarily temperature cluster',
        'Reduces overfitting risk by compressing the feature space',
        'Final output: PC1–PC7 columns in processed dataset'
      ],
      code: `from sklearn.decomposition import PCA\n\npca = PCA(n_components=7)\npca_features = pca.fit_transform(\n  scaled_weather\n)\n# Explained variance: 92.4%\n# PC1: 33.8% | PC2: 18.2% | PC3: 12.1%\nprint(pca.explained_variance_ratio_.cumsum())`
    },
    {
      num: '10', title: 'Model Training & Risk Prediction',
      subtitle: 'Classification output',
      badge: 'Output',
      desc: 'The processed, scaled, and PCA-reduced dataset is used to train ML classifiers that output Low, Medium, or High dengue risk. High Risk is defined as weekly cases ≥ 75th percentile of the district-specific historical baseline.',
      ops: [
        'Binary target: High Risk (cases ≥ 75th percentile) vs Low Risk',
        'Class imbalance handled via weighted class parameters',
        'Train/test split: 80/20 with temporal ordering preserved',
        'Final dataset saved as DengueRisk_Final_processed_dataset.csv'
      ],
      code: `from sklearn.ensemble import RandomForestClassifier\n\nmodel = RandomForestClassifier(\n  n_estimators=200,\n  class_weight='balanced',\n  random_state=42\n)\nmodel.fit(X_train_pca, y_train)\ny_pred = model.predict(X_test_pca)\n# Output: 0 = Low Risk, 1 = High Risk`
    }
  ];

  const EDA_CARDS = [
    {
      title: 'Dengue Cases by District',
      tag: 'Distribution',
      desc: 'Total dengue cases per district before encoding, showing Colombo and Gampaha with significantly higher case loads.',
      img: '../results/eda_visualizations/total dengue cases per district before encoding.png',
      body: 'This bar chart reveals the stark geographical disparity in dengue burden across Sri Lanka. Western Province districts (Colombo, Gampaha, Kalutara) account for the majority of total cases, reflecting high population density and urbanisation effects on vector proliferation.',
      insights: [
        'Colombo has the highest cumulative case count due to urban density',
        'Dry zone districts (Anuradhapura, Monaragala) show very low case loads',
        'District-specific risk thresholds were set at 75th percentile to account for these baseline differences'
      ]
    },
    {
      title: 'Correlation Heatmap',
      tag: 'Feature Analysis',
      desc: 'Pearson correlation matrix revealing strong relationships between temperature metrics and between sunshine/daylight duration.',
      img: '../results/eda_visualizations/correlation heatmap.png',
      body: 'The correlation heatmap identifies critical multicollinearity among weather features. Sunshine duration and daylight duration show r=0.87, while temperature metrics (mean, max, min) are strongly clustered. This multicollinearity justifies the application of PCA for dimensionality reduction.',
      insights: [
        'Sunshine & daylight duration: r=0.87 — high redundancy requiring PCA',
        'Temperature metrics (mean, max, min) form a tightly correlated cluster',
        'Precipitation shows weak correlation with temperature — independent signal'
      ]
    },
    {
      title: 'Cases per District & Risk Level',
      tag: 'Target Variable',
      desc: 'Box plot comparing average weekly cases under High vs Low risk classification for each district.',
      img: '../results/eda_visualizations/cases per district risk level.png',
      body: 'This visualisation validates the district-specific 75th percentile threshold approach. High-risk weeks clearly separate from low-risk weeks in case counts, but the absolute threshold differs greatly between densely-populated and rural districts — confirming the need for relative, district-specific thresholds.',
      insights: [
        '75th percentile threshold effectively separates High vs Low risk classes',
        'Urban districts (Colombo) have much higher absolute thresholds than rural ones',
        'District-specific baselines prevent bias toward high-population areas'
      ]
    },
    {
      title: 'Risk Level Distribution',
      tag: 'Class Balance',
      desc: 'Distribution of High vs Low risk weeks showing the 75-25 class split from the 75th percentile threshold definition.',
      img: '../results/eda_visualizations/disturbution of high and low risk weeks.png',
      body: 'The binary target distribution shows approximately 75% Low Risk and 25% High Risk weeks — a natural outcome of using the 75th percentile as the risk threshold. This moderate class imbalance guides the use of class weighting or SMOTE strategies during model training.',
      insights: [
        '75% Low Risk / 25% High Risk — inherent to 75th percentile definition',
        'Moderate imbalance manageable with class_weight="balanced" parameter',
        'Both classes are well-represented — no extreme imbalance concerns'
      ]
    },
    {
      title: 'Missing Values Before & After',
      tag: 'Data Cleaning',
      desc: 'Visual comparison of missing data columns before and after imputation using forward-fill and backward interpolation.',
      img: '../results/eda_visualizations/missingValues_before_after.png',
      body: 'This validation plot confirms the effectiveness of the imputation strategy. The raw dataset contained ~4.2% missing values primarily in evapotranspiration and wind speed columns from the Open-Meteo API. Sequential forward-fill resolved all gaps while maintaining temporal continuity.',
      insights: [
        '~4.2% overall missing rate in raw weather data from API',
        'Evapotranspiration and wind speed most affected columns',
        'Forward-fill followed by backward-fill achieves 100% completeness'
      ]
    },
    {
      title: 'Before & After Scaling',
      tag: 'Normalisation',
      desc: 'Distribution plots comparing feature scales before and after StandardScaler application.',
      img: '../results/eda_visualizations/before and after scaling.png',
      body: 'StandardScaler transforms all feature distributions to zero mean and unit variance. This plot shows features that previously had vastly different magnitude ranges (e.g., sunshine_duration in seconds vs temperature in °C) now occupying the same standardised scale — essential for PCA accuracy.',
      insights: [
        'Pre-scaling: features have wildly different magnitude ranges',
        'Post-scaling: all features centred at μ=0 with σ=1',
        'Prevents high-magnitude features from dominating PCA variance'
      ]
    },
    {
      title: 'Temperature Outlier Capping',
      tag: 'Winsorization',
      desc: 'Histograms showing temperature (mean and max) distributions before and after Winsorization at 1st/99th percentiles.',
      img: '../results/eda_visualizations/outlier capping for temp_mean_C and temp_max_C.png',
      body: 'Temperature outlier capping at 1–99th percentile boundaries removes sensor anomalies and measurement errors while retaining genuine extreme heat events. The post-capping distributions show clean, model-friendly boundaries without losing the ecological signal of heatwave periods.',
      insights: [
        'Capping at 1st/99th percentile retains 98% of natural variation',
        'Removes sensor measurement artifacts without sample deletion',
        'Stabilises StandardScaler estimation by removing leverage points'
      ]
    },
    {
      title: 'Rainfall & Min Temp Capping',
      tag: 'Winsorization',
      desc: 'Outlier capping for minimum temperature and weekly precipitation sum, preventing monsoonal extremes from skewing model weights.',
      img: '../results/eda_visualizations/outlier capping for temp_min_C and rain.png',
      body: 'Extreme monsoonal rainfall events (>200mm/week) are right-clipped to prevent model weight skewing. Minimum temperature capping addresses cold-spell anomalies in higher-elevation districts. The Winsorization preserves the signal of these events without allowing them to dominate classifier decisions.',
      insights: [
        'Right-side capping of extreme monsoon rainfall spikes above 200mm',
        'Prevents leverage points from skewing decision boundary placement',
        'Cold-spell anomalies in hill country districts are normalised'
      ]
    },
    {
      title: 'Wind & Evapotranspiration Capping',
      tag: 'Winsorization',
      desc: 'Wind speed and FAO evapotranspiration index distributions showing clean percentile-based outlier removal.',
      img: '../results/eda_visualizations/outlier capping for wind speed and evaporation.png',
      body: 'Wind speed and FAO evapotranspiration measurements contain measurement sensor spikes that appear as extreme outliers. Winsorization caps these while retaining the ecological value of high-wind events (which can disperse mosquito populations) as a genuine feature signal.',
      insights: [
        'Wind speed measurement spikes (sensor artifacts) removed via clipping',
        'FAO evapotranspiration index normalised for model input stability',
        'Ecological value of high-wind events preserved as genuine signal'
      ]
    },
    {
      title: 'PCA Variance Curve',
      tag: 'Dimensionality',
      desc: 'Scree plot showing cumulative explained variance across principal components — 7 PCs capture >90% of weather variance.',
      img: '../results/eda_visualizations/PCA variance curve.png',
      body: 'The PCA scree plot demonstrates that just 7 principal components from the weather feature set explain 92.4% of total variance. This significant dimension reduction from the original 12+ weather features eliminates multicollinearity while preserving the information content needed for dengue risk classification.',
      insights: [
        'PC1 alone: 33.8% variance — primarily temperature cluster',
        '7 PCs: 92.4% cumulative variance — diminishing returns beyond this',
        'Remaining 7.6% variance is noise — beneficial to exclude for overfitting prevention'
      ]
    },
    {
      title: 'Cases After District Encoding',
      tag: 'Encoding',
      desc: 'Dengue cases per district after target encoding, showing the numerical transformation of categorical district values.',
      img: '../results/eda_visualizations/cases per district after encoding.png',
      body: 'After target encoding, each district\'s categorical name is replaced by its mean historical risk score. This visualisation validates that the encoding captures the correct risk ordering — high-burden districts receive higher encoded values — making the transformation meaningful rather than arbitrary.',
      insights: [
        'Target encoding maps district → mean(risk_level): 0 to 1 scale',
        'Western Province districts correctly receive higher encoded values',
        'No data leakage as encoding computed from training set only'
      ]
    },
    {
      title: 'Sunshine & Daylight Duration',
      tag: 'Outlier Analysis',
      desc: 'Outlier capping for sunshine and daylight duration features showing distribution stabilisation.',
      img: '../results/eda_visualizations/outlier capping for sunshine and daylight duration.png',
      body: 'Sunshine and daylight duration measurements contain equipment calibration artifacts that appear as impossible high values. The Winsorization corrects these while preserving the genuine relationship between cloud cover (low sunshine/daylight ratio) and mosquito longevity — a key dengue transmission factor.',
      insights: [
        'Sunshine duration measured in seconds — scaled values can appear extreme',
        'High daylight/low sunshine ratio indicates high cloud cover → mosquito-friendly',
        'Capping removes calibration artifacts while keeping ecological signal'
      ]
    }
  ];

  /* ==============================
     SIDEBAR NAVIGATION
     ============================== */

  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section, .page-header');
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger-btn');

  // Hamburger toggle
  hamburger?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Close sidebar on outside click (mobile)
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 &&
        !sidebar.contains(e.target) &&
        !hamburger.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });

  // Active link highlight on scroll
  const observerOptions = { rootMargin: '-20% 0px -60% 0px' };
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navItems.forEach(item => item.classList.remove('active'));
        const active = document.querySelector(`[data-section="${id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, observerOptions);

  document.querySelectorAll('[id]').forEach(el => {
    if (['overview', 'districts', 'simulator', 'pipeline', 'eda', 'model', 'prevention'].includes(el.id)) {
      sectionObserver.observe(el);
    }
  });

  // Smooth close sidebar on nav click (mobile)
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) sidebar.classList.remove('open');
    });
  });

  /* ==============================
     DISTRICT CARDS
     ============================== */

  const districtGrid = document.getElementById('district-grid');
  const districtSearch = document.getElementById('district-search');
  const districtFilter = document.getElementById('district-filter');
  const districtModal = document.getElementById('district-modal');
  const districtModalClose = document.getElementById('district-modal-close');

  function renderDistricts(filter = 'all', search = '') {
    const searchLower = search.toLowerCase();
    const filtered = DISTRICTS.filter(d => {
      const matchRisk = filter === 'all' || d.risk === filter;
      const matchSearch = d.name.toLowerCase().includes(searchLower) ||
                          d.province.toLowerCase().includes(searchLower);
      return matchRisk && matchSearch;
    });

    districtGrid.innerHTML = filtered.length === 0
      ? `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">No districts match your search.</div>`
      : filtered.map(d => `
        <div class="dcard ${d.risk}" data-name="${d.name}" role="button" tabindex="0">
          <div class="dcard-header">
            <div>
              <div class="dcard-name">${d.name}</div>
              <div class="dcard-province">${d.province} Province</div>
            </div>
            <span class="risk-pill ${d.risk}">${d.risk.charAt(0).toUpperCase() + d.risk.slice(1)}</span>
          </div>
          <div class="dcard-stats">
            <div class="dstat">
              <div class="dstat-val">${d.cases}</div>
              <div class="dstat-label">Weekly Cases</div>
            </div>
            <div class="dstat">
              <div class="dstat-val">${d.rainfall}</div>
              <div class="dstat-label">Rainfall</div>
            </div>
            <div class="dstat">
              <div class="dstat-val">${d.temp}</div>
              <div class="dstat-label">Avg Temp</div>
            </div>
          </div>
          <div class="dcard-trend">
            <span class="trend-arrow ${d.trend === 'up' ? 'trend-up' : d.trend === 'down' ? 'trend-down' : 'trend-flat'}">
              ${d.trend === 'up' ? '↑' : d.trend === 'down' ? '↓' : '→'}
            </span>
            <span>${d.trendLabel}</span>
          </div>
          <div class="dcard-reason">${d.reason}</div>
        </div>
      `).join('');

    // Card click → district modal
    districtGrid.querySelectorAll('.dcard').forEach(card => {
      card.addEventListener('click', () => openDistrictModal(card.dataset.name));
      card.addEventListener('keypress', e => { if (e.key === 'Enter') openDistrictModal(card.dataset.name); });
    });
  }

  function openDistrictModal(name) {
    const d = DISTRICTS.find(x => x.name === name);
    if (!d) return;
    document.getElementById('dmodal-name').textContent = d.name;
    const riskBadge = document.getElementById('dmodal-risk');
    riskBadge.textContent = d.risk.charAt(0).toUpperCase() + d.risk.slice(1) + ' Risk';
    riskBadge.className = `dmodal-risk-badge ${d.risk}`;

    document.getElementById('dmodal-body').innerHTML = `
      <div class="dmodal-stat-row">
        <div class="dmodal-stat">
          <div class="dmodal-stat-val">${d.cases}</div>
          <div class="dmodal-stat-label">Weekly Cases</div>
        </div>
        <div class="dmodal-stat">
          <div class="dmodal-stat-val">${d.rainfall}</div>
          <div class="dmodal-stat-label">Rainfall</div>
        </div>
        <div class="dmodal-stat">
          <div class="dmodal-stat-val">${d.temp}</div>
          <div class="dmodal-stat-label">Avg Temperature</div>
        </div>
      </div>
      <div class="dmodal-reason">
        <strong>Risk Analysis:</strong> ${d.reason}
      </div>
      <div style="font-size:12px;color:var(--text-muted);padding:4px 0;">
        Province: ${d.province} · Trend: ${d.trendLabel}
      </div>
    `;
    districtModal.classList.add('active');
  }

  districtSearch.addEventListener('input', () =>
    renderDistricts(districtFilter.value, districtSearch.value));
  districtFilter.addEventListener('change', () =>
    renderDistricts(districtFilter.value, districtSearch.value));
  districtModalClose.addEventListener('click', () => districtModal.classList.remove('active'));
  districtModal.addEventListener('click', e => { if (e.target === districtModal) districtModal.classList.remove('active'); });

  renderDistricts();

  /* ==============================
     RISK SIMULATOR
     ============================== */

  const simDistrict = document.getElementById('sim-district');
  const simRain = document.getElementById('sim-rain');
  const simTemp = document.getElementById('sim-temp');
  const simSunshine = document.getElementById('sim-sunshine');
  const simWind = document.getElementById('sim-wind');

  const simRainVal = document.getElementById('sim-rain-val');
  const simTempVal = document.getElementById('sim-temp-val');
  const simSunshineVal = document.getElementById('sim-sunshine-val');
  const simWindVal = document.getElementById('sim-wind-val');

  const predictBtn = document.getElementById('predict-btn');
  const gaugeArc = document.getElementById('gauge-arc');
  const gaugeNeedle = document.getElementById('gauge-needle');
  const gaugePct = document.getElementById('gauge-pct');
  const riskBadgeLarge = document.getElementById('risk-badge-large');
  const riskBadgeText = document.getElementById('risk-badge-text');
  const confidencePct = document.getElementById('confidence-pct');
  const confidenceBar = document.getElementById('confidence-bar');
  const resultExplanation = document.getElementById('result-explanation');
  const resultFactors = document.getElementById('result-factors');
  const fbRain = document.getElementById('fb-rain');
  const fbTemp = document.getElementById('fb-temp');
  const fbSun = document.getElementById('fb-sun');
  const currentRiskIndicator = document.getElementById('cri-badge');

  // Update slider value displays
  function updateSliderDisplay() {
    simRainVal.textContent = simRain.value + ' mm';
    simTempVal.textContent = parseFloat(simTemp.value).toFixed(1) + ' °C';
    simSunshineVal.textContent = parseFloat(simSunshine.value).toFixed(1) + ' hrs';
    simWindVal.textContent = simWind.value + ' km/h';
  }

  [simRain, simTemp, simSunshine, simWind].forEach(slider => {
    slider.addEventListener('input', updateSliderDisplay);
  });
  updateSliderDisplay();

  // Gauge arc path total length = 251.2 (half circle)
  const ARC_LENGTH = 251.2;

  function setGauge(percent, color) {
    const offset = ARC_LENGTH - (percent / 100) * ARC_LENGTH;
    gaugeArc.style.strokeDashoffset = offset;
    gaugeArc.style.stroke = color;

    // Rotate needle: 0% → -90deg, 100% → +90deg
    const deg = -90 + (percent / 100) * 180;
    gaugeNeedle.setAttribute('transform', `rotate(${deg}, 100, 100)`);

    gaugePct.textContent = percent + '%';
    gaugePct.style.color = color;
  }

  function runPrediction() {
    const baseRisk = parseFloat(simDistrict.options[simDistrict.selectedIndex].dataset.base);
    const rain = parseInt(simRain.value);
    const temp = parseFloat(simTemp.value);
    const sunshine = parseFloat(simSunshine.value);
    const wind = parseInt(simWind.value);
    const district = simDistrict.value;

    // === Biological temperature response (optimal: 27-30°C) ===
    const tempFactor = Math.max(0, 1 - Math.pow((temp - 28.5) / 7, 2));

    // === Rainfall response: moderate rain increases breeding; extreme washes away ===
    let rainFactor;
    if (rain <= 90) {
      rainFactor = Math.sin((rain / 90) * (Math.PI / 2));
    } else {
      rainFactor = Math.max(0.15, 1.0 - 0.5 * ((rain - 90) / 110));
    }

    // === Sunshine: low sunshine = cloudy/humid = longer mosquito lifespan ===
    const sunshineFactor = Math.max(0, 1 - (sunshine / 12));

    // === Wind: high wind disperses mosquitoes ===
    const windFactor = Math.max(0, 1 - (wind / 50));

    // === Composite risk score ===
    const score = (baseRisk * 0.35) +
                  (tempFactor * 0.28) +
                  (rainFactor * 0.22) +
                  (sunshineFactor * 0.10) +
                  (windFactor * 0.05);

    let probability = Math.round(score * 100);
    probability = Math.max(8, Math.min(94, probability));

    // Factor percentages for display
    const rfPct = Math.round(rainFactor * 100);
    const tfPct = Math.round(tempFactor * 100);
    const sfPct = Math.round(sunshineFactor * 100);
    fbRain.style.width = rfPct + '%';
    fbTemp.style.width = tfPct + '%';
    fbSun.style.width = sfPct + '%';

    // Confidence = inverse of uncertainty (how close to 0 or 100 we are)
    const distFromMid = Math.abs(probability - 50);
    const confidence = Math.round(55 + distFromMid * 0.7);

    // Determine risk level
    let riskLevel, color, badgeClass, explanation;
    if (probability >= 65) {
      riskLevel = '🔴 High Risk';
      color = '#ef4444';
      badgeClass = 'high';
      if (rain > 90) {
        explanation = `⚠️ <strong>High Risk Alert for ${district}.</strong> Extreme rainfall (${rain}mm) combined with optimal temperature (${temp.toFixed(1)}°C) creates critical standing water hazards. High mosquito breeding probability. Immediate preventive action is recommended.`;
      } else if (temp > 30) {
        explanation = `⚠️ <strong>High Risk Alert for ${district}.</strong> Elevated temperatures (${temp.toFixed(1)}°C) significantly accelerate the dengue virus extrinsic incubation period, increasing transmission velocity. Increase community awareness immediately.`;
      } else {
        explanation = `⚠️ <strong>High Risk Alert for ${district}.</strong> Combined weather vectors (rainfall ${rain}mm, temperature ${temp.toFixed(1)}°C) align at high-risk thresholds. High probability of mosquito vector proliferation in this district.`;
      }
    } else if (probability >= 40) {
      riskLevel = '🟡 Medium Risk';
      color = '#f59e0b';
      badgeClass = 'medium';
      explanation = `⚠️ <strong>Medium Risk detected for ${district}.</strong> Weather conditions (rainfall ${rain}mm, temperature ${temp.toFixed(1)}°C) are moderately favourable for mosquito breeding. Preventive measures such as removing stagnant water and monitoring drain systems are advised.`;
    } else {
      riskLevel = '🟢 Low Risk';
      color = '#10b981';
      badgeClass = 'low';
      if (temp < 23) {
        explanation = `✅ <strong>Low Risk for ${district}.</strong> Sub-optimal temperature (${temp.toFixed(1)}°C) significantly reduces mosquito breeding cycle efficiency and viral replication rates. Continue routine preventive measures.`;
      } else {
        explanation = `✅ <strong>Low Risk for ${district}.</strong> Current weather profile (rainfall ${rain}mm, temperature ${temp.toFixed(1)}°C) remains within safe parameters. Risk of dengue transmission is currently low.`;
      }
    }

    // Update UI
    setGauge(probability, color);
    riskBadgeLarge.className = `risk-badge-large ${badgeClass}`;
    riskBadgeText.textContent = riskLevel;
    confidencePct.textContent = confidence + '%';
    confidenceBar.style.width = confidence + '%';
    resultExplanation.innerHTML = `<p>${explanation}</p>`;
    resultFactors.style.display = 'flex';

    // Update prevention panel to match
    updatePreventionFromRisk(badgeClass);

    // Update current risk indicator in prevention section
    currentRiskIndicator.textContent = riskLevel.replace(/^[^ ]+ /, '');
    currentRiskIndicator.className = `cri-badge ${badgeClass}`;
  }

  predictBtn.addEventListener('click', runPrediction);

  /* ==============================
     ML PIPELINE STEPS
     ============================== */

  const pipelineStepsEl = document.getElementById('pipeline-steps');
  const pipelineDetail = document.getElementById('pipeline-detail');

  pipelineStepsEl.innerHTML = PIPELINE_STEPS.map((step, idx) => `
    <div class="pipeline-step${idx === 0 ? ' active' : ''}" data-idx="${idx}" role="button" tabindex="0">
      <div class="step-dot">${step.num}</div>
      <div class="step-content">
        <div class="step-title">${step.title}</div>
        <div class="step-subtitle">${step.subtitle}</div>
      </div>
      <span class="step-badge">${step.badge}</span>
    </div>
  `).join('');

  function renderPipelineDetail(idx) {
    const s = PIPELINE_STEPS[idx];
    pipelineDetail.innerHTML = `
      <div class="detail-step-label">Step ${s.num} · ${s.badge}</div>
      <div class="detail-title">${s.title}</div>
      <div class="detail-desc">${s.desc}</div>
      <div class="detail-ops-title">Key Operations</div>
      <div class="detail-ops">
        ${s.ops.map(op => `<div class="detail-op">${op}</div>`).join('')}
      </div>
      <pre class="detail-code">${s.code}</pre>
    `;
  }

  renderPipelineDetail(0);

  pipelineStepsEl.querySelectorAll('.pipeline-step').forEach(step => {
    step.addEventListener('click', () => {
      pipelineStepsEl.querySelectorAll('.pipeline-step').forEach(s => s.classList.remove('active'));
      step.classList.add('active');
      renderPipelineDetail(parseInt(step.dataset.idx));
    });
    step.addEventListener('keypress', e => { if (e.key === 'Enter') step.click(); });
  });

  /* ==============================
     EDA CARDS
     ============================== */

  const edaGrid = document.getElementById('eda-grid');
  const edaModal = document.getElementById('eda-modal');
  const edaModalClose = document.getElementById('eda-modal-close');
  const modalImg = document.getElementById('modal-img');
  const modalTag = document.getElementById('modal-tag');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalInsights = document.getElementById('modal-insights');

  edaGrid.innerHTML = EDA_CARDS.map((card, idx) => `
    <div class="eda-card" data-idx="${idx}" role="button" tabindex="0">
      <div class="eda-img-wrapper">
        <img
          src="${card.img}"
          alt="${card.title}"
          onerror="this.parentElement.innerHTML='<div class=\\'eda-img-placeholder\\'><span>📊</span><p>${card.title}</p></div>'"
        />
        <div class="eda-overlay"><span class="eda-overlay-text">View Details</span></div>
      </div>
      <div class="eda-info">
        <span class="eda-tag">${card.tag}</span>
        <div class="eda-title">${card.title}</div>
        <div class="eda-desc">${card.desc}</div>
      </div>
    </div>
  `).join('');

  function openEdaModal(idx) {
    const card = EDA_CARDS[idx];
    modalImg.src = card.img;
    modalImg.alt = card.title;
    modalImg.onerror = () => {
      modalImg.parentElement.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted);font-size:13px;">📊 Chart available in notebook results</div>`;
    };
    modalTag.textContent = card.tag;
    modalTitle.textContent = card.title;
    modalBody.textContent = card.body;
    modalInsights.innerHTML = card.insights.map(i =>
      `<div class="modal-insight-item">${i}</div>`
    ).join('');
    edaModal.classList.add('active');
  }

  edaGrid.querySelectorAll('.eda-card').forEach(card => {
    card.addEventListener('click', () => openEdaModal(parseInt(card.dataset.idx)));
    card.addEventListener('keypress', e => { if (e.key === 'Enter') openEdaModal(parseInt(card.dataset.idx)); });
  });

  edaModalClose.addEventListener('click', () => edaModal.classList.remove('active'));
  edaModal.addEventListener('click', e => { if (e.target === edaModal) edaModal.classList.remove('active'); });

  /* ==============================
     PREVENTION TABS
     ============================== */

  const prevTabs = document.querySelectorAll('.prev-tab');
  const prevPanels = document.querySelectorAll('.prev-panel');

  prevTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      prevTabs.forEach(t => t.classList.remove('active'));
      prevPanels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`panel-${tab.dataset.level}`).classList.add('active');
    });
  });

  function updatePreventionFromRisk(level) {
    prevTabs.forEach(t => t.classList.remove('active'));
    prevPanels.forEach(p => p.classList.remove('active'));
    const tab = document.querySelector(`.prev-tab[data-level="${level}"]`);
    const panel = document.getElementById(`panel-${level}`);
    if (tab) tab.classList.add('active');
    if (panel) panel.classList.add('active');
  }

  /* ==============================
     KEYBOARD MODAL CLOSE
     ============================== */

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      edaModal.classList.remove('active');
      districtModal.classList.remove('active');
    }
  });

  /* ==============================
     INIT ANIMATIONS — Intersection Observer
     ============================== */

  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        animObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '-5% 0px' });

  document.querySelectorAll('.acard, .dcard, .eda-card, .model-card, .prev-action').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .4s ease, transform .4s ease';
    animObserver.observe(el);
  });

  /* ==============================
     SLIDER FILL COLOUR (visual)
     ============================== */

  function updateSliderFill(slider) {
    const min = slider.min || 0;
    const max = slider.max || 100;
    const val = ((slider.value - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, var(--teal) ${val}%, var(--border) ${val}%)`;
  }

  [simRain, simTemp, simSunshine, simWind].forEach(slider => {
    updateSliderFill(slider);
    slider.addEventListener('input', () => updateSliderFill(slider));
  });

});
