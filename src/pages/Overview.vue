<template>
  <div class="content">
    <div class="container-fluid">
      <!-- Header avec filtres de date -->
      <div class="row mb-4">
        <div class="col-md-12">
          <div class="card">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-md-8">
                  <h4 class="card-title mb-0">Tableau de bord des présences</h4>
                  <p class="card-category mb-0">
                    <i class="fa fa-calendar-alt mr-1"></i>
                    Période : <strong>{{ formatPeriodDisplay() }}</strong>
                    <span class="text-muted ml-2">({{ periodDays }} jours)</span>
                  </p>
                </div>
                <div class="col-md-4 text-right">
                  <button class="btn btn-info" @click="refreshDashboard" :disabled="isLoading">
                    <i class="fa fa-refresh" :class="{ 'fa-spin': isLoading }"></i>
                    {{ isLoading ? 'Chargement...' : 'Actualiser' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres de période -->
      <div class="row mb-4">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fa fa-filter mr-2"></i>Filtrer par période
              </h5>
              <!-- Info période actuelle -->
              <div class="alert alert-info mt-3 mb-0" v-if="dateFilters.period !== 'custom'">
                <i class="fa fa-info-circle mr-2"></i>
                Données affichées du <strong>{{ formatDateDisplay(dateFilters.startDate) }}</strong>
                au <strong>{{ formatDateDisplay(dateFilters.endDate) }}</strong>
              </div>
            </div>
            <div class="card-body">
              <!-- Boutons de période rapide -->
              <div class="mb-3">
                <div class="btn-group btn-group-toggle" role="group">
                  <button v-for="period in periodOptions" :key="period.value" type="button"
                    class="btn btn-outline-secondary" :class="{ active: dateFilters.period === period.value }"
                    @click="handlePeriodChange(period.value)">
                    <i :class="'fa ' + period.icon + ' mr-1'"></i>
                    {{ period.label }}
                  </button>
                </div>
              </div>

              <!-- Sélecteur de dates personnalisé -->
              <div v-if="dateFilters.period === 'custom'" class="row">
                <div class="col-md-4">
                  <div class="form-group">
                    <label for="startDate">Date de début</label>
                    <input type="date" id="startDate" class="form-control" v-model="dateFilters.startDate"
                      :max="dateFilters.endDate" @change="handleCustomDateChange">
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-group">
                    <label for="endDate">Date de fin</label>
                    <input type="date" id="endDate" class="form-control" v-model="dateFilters.endDate"
                      :min="dateFilters.startDate" :max="formatDate(new Date())" @change="handleCustomDateChange">
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-5">
        <i class="fa fa-spinner fa-spin fa-3x"></i>
        <p class="mt-3">Chargement des données pour la période sélectionnée...</p>
      </div>

      <!-- Dashboard Content -->
      <div v-else>
        <!-- Stats Cards -->
        <div class="row">
          <div class="col-xl-3 col-md-6">
            <stats-card>
              <div slot="header" class="icon-success">
                <i class="fa-solid fa-fingerprint" style="color: green;"></i>
              </div>
              <div slot="content">
                <p class="card-category">Présents</p>
                <h4 class="card-title">{{ presentCount }}</h4>
                <small class="text-muted">Sur {{ totalEmployees }} empl</small>
              </div>
              <div slot="footer">
                <i class="fa fa-calendar"></i> {{ new Date().toLocaleDateString('fr-FR') }}
              </div>
            </stats-card>
          </div>

          <div class="col-xl-3 col-md-6">
            <stats-card>
              <div slot="header" class="icon-warning">
                <i class="fa-regular fa-clock" style="color: #d6a800;"></i>
              </div>
              <div slot="content">
                <p class="card-category">Retards période</p>
                <h4 class="card-title">{{ filtered_data.data?.summary?.totalLates || 0 }}</h4>
                <small class="text-muted">
                  Sur {{ periodDays }} {{ employee.totalRecords }} j
                </small>
              </div>
              <div slot="footer">
                <i class="fa fa-history"></i> Période sélectionnée
              </div>
            </stats-card>
          </div>

          <div class="col-xl-3 col-md-6">
            <stats-card>
              <div slot="header" class="icon-danger">
                <i class="fa-regular fa-face-frown" style="color: #bd0000;"></i>
              </div>
              <div slot="content">
                <p class="card-category">Absences période</p>
                <h4 class="card-title">{{ filtered_data.data?.summary?.totalAbsences || 0 }}</h4>
                <small class="text-muted">
                  Moy: {{ (filtered_data.data?.summary?.totalAbsences / periodDays).toFixed(1) }}/j
                </small>
              </div>
              <div slot="footer">
                <i class="fa fa-calendar"></i> Période sélectionnée
              </div>
            </stats-card>
          </div>

          <div class="col-xl-3 col-md-6">
            <stats-card>
              <div slot="header" class="icon-info">
                <i class="fa-solid fa-chart-line" style="color: #2e9ff5;"></i>
              </div>
              <div slot="content">
                <p class="card-category">Score moyen</p>
                <h4 class="card-title" :class="{
                  'text-success': averageScore > -100,
                  'text-warning': averageScore <= -100 && averageScore > -200,
                  'text-danger': averageScore <= -200
                }">
                  {{ (Number(averageScore) / Number(totalEmployees)).toFixed(2) }}

                </h4>
                <small class="text-muted">D'employé</small>
              </div>
              <div slot="footer">
                <i class="fa fa-chart-bar"></i> Période sélectionnée
              </div>
            </stats-card>
          </div>
        </div>

        <!-- Première ligne de charts -->
        <div class="row">
          <div class="col-md-6">
            <chart-card :chart-data="performanceChart.data" :chart-options="performanceChart.options" chart-type="Line">
              <template slot="header">
                <h4 class="card-title">Performance des employés</h4>
                <p class="card-category">Scores pour la période</p>
              </template>
              <template slot="footer">
                <div class="legend">
                  <i class="fa fa-circle text-info"></i> Score total période
                </div>
                <hr />
                <div class="stats">
                  <i class="fa fa-history"></i> Période: {{ formatPeriodDisplay() }}
                </div>
              </template>
            </chart-card>

          </div>

          <div class="col-md-6">
            <chart-card :chart-data="absenceDistributionChart.data" :chart-options="absenceDistributionChart.options"
              chart-type="Pie">
              <template slot="header">
                <h4 class="card-title">Distribution des absences</h4>
                <p class="card-category">Pour la période</p>
              </template>
              <template slot="footer">
                <div class="legend">
                  <i class="fa fa-circle text-danger"></i> Absences période
                </div>
                <hr />
                <div class="stats">
                  <i class="fa fa-clock-o"></i> Total: {{ filtered_data.data?.summary?.totalAbsences || 0 }}
                </div>
              </template>
            </chart-card>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <chart-card :chart-data="timeTrendChart.data" :chart-options="timeTrendChart.options" chart-type="Line">
              <template slot="header">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <div>
                    <h4 class="card-title">Tendance temporelle</h4>
                    <p class="card-category">
                      Évolution sur {{ timeTrendChart.data.labels.length }} jours
                      <span class="badge badge-info ml-2">
                        {{ dateFilters.startDate }} → {{ dateFilters.endDate }}
                      </span>
                    </p>
                  </div>
                 <div class="text-muted">
  <small>Cliquez sur la légende pour filtrer les séries</small>
</div>
                </div>

              </template>
              <template slot="footer">
                <div class="legend">
                  <i class="fa fa-circle text-success"></i> Taux de présence (%)
                  <i class="fa fa-circle text-danger ml-3"></i> Nombre d'absences
                  <i class="fa fa-circle text-warning ml-3"></i> Nombre de retards
                </div>
                <hr />
                <div class="stats">
                  <i class="fa fa-history"></i> Données mises à jour à l'instant
                </div>

              </template>
            </chart-card>

          </div>
        </div>


        <!-- Deuxième ligne de charts -->
        <div class="row">
          <div class="col-md-6">
            <chart-card :chart-data="topEmployeesChart.data" :chart-options="topEmployeesChart.options"
              chart-type="Bar">
              <template slot="header">
                <h4 class="card-title">Top 5 période</h4>
                <p class="card-category">Meilleurs scores pour la période</p>
              </template>
              <template slot="footer">
                <div class="legend">
                  <i class="fa fa-circle text-success"></i> Score période
                </div>
                <hr />
                <div class="stats">
                  <i class="fa fa-history"></i> Classement pour la période
                </div>
              </template>
            </chart-card>
          </div>

          <div class="col-md-6">
            <chart-card :chart-data="lateVsAbsenceChart.data" :chart-options="lateVsAbsenceChart.options"
              chart-type="Bar">
              <template slot="header">
                <h4 class="card-title">Retards vs Absences</h4>
                <p class="card-category">Pour la période sélectionnée</p>
              </template>
              <template slot="footer">
                <div class="legend">
                  <i class="fa fa-circle text-warning"></i> Retards: {{ filtered_data.data?.summary?.totalLates || 0
                  }}
                  <i class="fa fa-circle text-danger"></i> Absences: {{ filtered_data.data?.summary?.totalAbsences ||
                    0
                  }}
                </div>
                <hr />
                <div class="stats">
                  <i class="fa fa-check"></i> Données filtrées
                </div>
              </template>
            </chart-card>
          </div>
        </div>

        <!-- Tableau des employés -->
        <div class="row">
          <div class="col-md-12">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <div>
                  <h4 class="card-title">Statistiques des employés</h4>
                  <p class="card-category">Données pour la période: {{ formatPeriodDisplay() }}</p>
                </div>
                <div class="btn-group">
                  <button class="btn btn-sm btn-outline-secondary" @click="handlePeriodChange('today')">
                    <i class="fa fa-calendar-day"></i> Auj
                  </button>
                  <button class="btn btn-sm btn-outline-secondary" @click="handlePeriodChange('week')">
                    <i class="fa fa-calendar-week"></i> Sem
                  </button>
                  <button class="btn btn-sm btn-outline-secondary" @click="handlePeriodChange('last-month')">
                    <i class="fa fa-calendar-alt"></i> 1M
                  </button>
                  <button class="btn btn-sm btn-outline-secondary" @click="handlePeriodChange('all')">
                    <i class="fa fa-infinity"></i> Tous
                  </button>
                </div>
              </div>
              <div class="card-body">
                <div class="table-responsive" v-if="filtered_data.data?.employees">
                  <table class="table table-hover">
                    <thead class="text-primary">
                      <tr>
                        <th>Rang</th>
                        <th>Employé</th>
                        <th>Score période</th>
                        <th>Absences</th>
                        <th>Retards</th>
                        <th>Jours</th>
                        <th>Moyenne/jour</th>
                        <th>Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="employee in filtered_data.data.employees" :key="employee.employeeId" :class="{
                        'table-success': employee.rank === 1,
                        'table-warning': employee.rank === filtered_data.data.totalEmployees
                      }">
                        <td>
                          <span class="badge" :class="{
                            'badge-success': employee.rank === 1,
                            'badge-warning': employee.rank === 2,
                            'badge-info': employee.rank === 3,
                            'badge-secondary': employee.rank > 3
                          }">
                            {{ employee.rank }}
                          </span>
                        </td>
                        <td>
                          <strong>{{ getEmployeeName(employee.employeeId) }}</strong>
                          <br>
                          <small class="text-muted">{{ employee.employeeId }}</small>
                        </td>
                        <td :class="{
                          'text-success': employee.totalScore > -100,
                          'text-warning': employee.totalScore <= -100 && employee.totalScore > -200,
                          'text-danger': employee.totalScore <= -200
                        }">
                          <strong>{{ employee.formattedTotalScore }}</strong>
                        </td>
                        <td>
                          <span class="badge badge-pill badge-danger" v-if="employee.totalAbsence > 0">
                            {{ employee.totalAbsence }}
                          </span>
                          <span v-else class="text-muted">0</span>
                        </td>
                        <td>
                          <span class="badge badge-pill badge-warning" v-if="employee.totalLate > 0">
                            {{ employee.totalLate }}
                          </span>
                          <span v-else class="text-muted">0</span>
                        </td>
                        <td>{{ employee.totalRecords }}</td>
                        <td>{{ (employee.totalScore / employee.totalRecords || 0).toFixed(2) }}</td>
                        <td>
                          <div class="d-flex align-items-center">
                            <div class="progress flex-grow-1 mr-2" style="height: 6px;">
                              <div class="progress-bar" :class="'bg-' + getPerformanceClass(employee.totalScore)"
                                :style="{ width: getPerformancePercentage(employee.totalScore) + '%' }">
                              </div>
                            </div>
                            <small>{{ getPerformancePercentage(employee.totalScore).toFixed(0) }}%</small>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="text-center py-4">
                  <i class="fa fa-exclamation-triangle fa-2x text-warning"></i>
                  <p class="mt-2">Aucune donnée disponible pour cette période</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ChartCard from "src/components/Cards/ChartCard.vue";
import StatsCard from "src/components/Cards/StatsCard.vue";
import LTable from "src/components/Table.vue";
import axios from "axios";
import dayjs from "dayjs"; // Si vous avez dayjs installé, sinon utilisez new Date()

export default {
  components: {
    LTable,
    ChartCard,
    StatsCard,
  },
  data() {
    // Dates par défaut: dernier mois
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    return {
      editTooltip: "Edit Task",
      deleteTooltip: "Remove",

      // Filtres de dates
      dateFilters: {
        startDate: this.formatDate(oneMonthAgo),
        endDate: this.formatDate(today),
        period: 'last-month' // 'today', 'week', 'last-month', 'last-3-months', 'custom'
      },

      // Données
      global_stats: { data: {} },
      all_employees_totals: { data: {} },
      ranking_data: { data: {} },
      daily_score: [],
      filtered_data: { data: {} },
      employee: [],

      // Compteurs
      absentCount: 0,
      lateCount: 0,
      presentCount: 0,
      isLoading: true,

      // Options de période
      periodOptions: [
        { value: 'today', label: "Aujourd'hui", icon: "fa-calendar-day" },
        { value: 'week', label: "Cette semaine", icon: "fa-calendar-week" },
        { value: 'last-month', label: "1 mois", icon: "fa-calendar-alt" },
        { value: 'last-3-months', label: "3 mois", icon: "fa-calendar" },
        { value: 'last-6-months', label: "6 mois", icon: "fa-calendar" },
        { value: 'year', label: "Cette année", icon: "fa-calendar" },
        { value: 'all', label: "Tous", icon: "fa-infinity" },
        { value: 'custom', label: "Personnalisé", icon: "fa-calendar-check" }
      ],

      // Charts Data
      performanceChart: {
        data: {
          labels: [],
          series: [[]]
        },
        options: {
          low: -400,
          high: 0,
          showArea: true,
          height: "245px",
          axisX: {
            showGrid: false,
          },
          lineSmooth: true,
          showLine: true,
          showPoint: true,
          fullWidth: true,
          chartPadding: {
            right: 50,
          },
        }
      },

      absenceDistributionChart: {
        data: {
          labels: [],
          series: []
        },
        options: {
          donut: true,
          donutWidth: 60,
          startAngle: 270,
          total: 100,
          showLabel: true,
          height: "245px",
          labelInterpolationFnc: function (value) {
            return value;
          }
        }
      },

      lateVsAbsenceChart: {
        data: {
          labels: ['Retards', 'Absences'],
          series: [[0, 0]]
        },
        options: {
          height: "245px",
          low: 0,
        }
      },

      topEmployeesChart: {
        data: {
          labels: [],
          series: [[]]
        },
        options: {
          horizontalBars: true,
          axisY: {
            offset: 70
          },
          height: "300px",
          low: -400,
          high: 0
        }
      },

      // Chart de tendance temporelle
      timeTrendChart: {
        data: {
          labels: [],
          series: [] // Devrait être un tableau de tableaux
        },
        options: {
          low: 0,
          high: 100,
          showArea: true,
          height: "300px", // Un peu plus haut
          axisX: {
            showGrid: true,
            labelInterpolationFnc: function (value, index) {
              // Afficher seulement certaines dates pour éviter le surchargement
              return index % 5 === 0 ? value : '';
            }
          },
          fullWidth: true,
          chartPadding: {
            top: 20,
            right: 30,
            bottom: 20,
            left: 30
          }
        }
      }
    };
  },

  async created() {
    await this.loadDashboardData();
    this.updateChartsData();
    this.isLoading = false;
  },

  methods: {
    formatDate(date) {
      // Format YYYY-MM-DD pour les inputs date
      const d = new Date(date);
      const month = '' + (d.getMonth() + 1);
      const day = '' + d.getDate();
      const year = d.getFullYear();

      return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
    },

    getDateRangeForPeriod(period) {
      const today = new Date();
      const startDate = new Date();

      switch (period) {
        case 'today':
          startDate.setDate(today.getDate());
          break;
        case 'week':
          startDate.setDate(today.getDate() - 7);
          break;
        case 'last-month':
          startDate.setMonth(today.getMonth() - 1);
          break;
        case 'last-3-months':
          startDate.setMonth(today.getMonth() - 3);
          break;
        case 'last-6-months':
          startDate.setMonth(today.getMonth() - 6);
          break;
        case 'year':
          startDate.setFullYear(today.getFullYear() - 1);
          break;
        case 'all':
          // Dates très éloignées pour "tous"
          startDate.setFullYear(2020);
          break;
        default:
          startDate.setMonth(today.getMonth() - 1);
      }

      return {
        startDate: this.formatDate(startDate),
        endDate: this.formatDate(today)
      };
    },

    handlePeriodChange(period) {
      this.dateFilters.period = period;

      if (period !== 'custom') {
        const dateRange = this.getDateRangeForPeriod(period);
        this.dateFilters.startDate = dateRange.startDate;
        this.dateFilters.endDate = dateRange.endDate;

        // Recharger les données avec le nouveau filtre
        this.refreshDashboard();
      }
    },

    handleCustomDateApply() {
      if (this.dateFilters.startDate && this.dateFilters.endDate) {
        this.dateFilters.period = 'custom';
        this.refreshDashboard();
      }
    },

    async loadDashboardData() {
      try {
        this.isLoading = true;

        // 1. Données globales (toujours toutes les données)
        const globalStats = await axios.get(
          "https://tsg-back.onrender.com/api/scores/global-stats"
        );
        this.global_stats = globalStats.data;

        // 2. Données filtrées par période
        const filteredData = await axios.get(
          "https://tsg-back.onrender.com/api/scores/all/totals/period",
          {
            params: {
              startDate: this.dateFilters.startDate,
              endDate: this.dateFilters.endDate
            }
          }
        );
        this.filtered_data = filteredData.data;

        // 3. Classement avec filtre
        const ranking = await axios.get(
          "https://tsg-back.onrender.com/api/scores/ranking",
          {
            params: {
              startDate: this.dateFilters.startDate,
              endDate: this.dateFilters.endDate,
              limit: 5
            }
          }
        );
        this.ranking_data = ranking.data;

        // 4. Données du jour (toujours aujourd'hui)
        const dailyData = await axios.get(
          "https://tsg-back.onrender.com/api/attendance/compute/daily"
        );
        this.daily_score = dailyData.data;
        const results = dailyData.data.results || [];

        // Calcul des compteurs du jour
        this.absentCount = results.filter(r =>
          !r.details.checkIn || r.details.checkIn === null || r.details.checkIn === ''
        ).length;

        this.lateCount = results.filter(r =>
          r.details.breakdown && r.details.breakdown.latePenalty < 0
        ).length;

        this.presentCount = results.length - this.absentCount;

        // 5. Historique pour le chart de tendance
        await this.loadTimeTrendData();

      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);

        // Fallback: charger toutes les données si l'endpoint filtré n'existe pas
        try {
          const allEmployees = await axios.get(
            "https://tsg-back.onrender.com/api/scores/all/totals?basic=true"
          );
          this.filtered_data = allEmployees.data;
        } catch (fallbackError) {
          console.error("Erreur fallback:", fallbackError);
        }
      } finally {
        this.isLoading = false;
      }
    },

    async loadTimeTrendData() {
      try {
        const trendData = await axios.get(
          "https://tsg-back.onrender.com/api/scores/time-trend",
          {
            params: {
              startDate: this.dateFilters.startDate,
              endDate: this.dateFilters.endDate
            }
          }
        );

        if (trendData.data.ok && trendData.data.data) {
          this.timeTrendChart.data = {
            labels: trendData.data.data.labels,
            series: [
              trendData.data.data.series[0].data, // Taux de présence
              trendData.data.data.series[1].data, // Absences
              trendData.data.data.series[2].data  // Retards
            ]
          };
          this.timeTrendChart.options = {
            ...this.timeTrendChart.options,
            series: {
              0: { className: 'ct-series ct-series-a' }, // Présence
              1: { className: 'ct-series ct-series-b' }, // Absences
              2: { className: 'ct-series ct-series-c' }  // Retards
            }
          };

          // Ajuster les options du chart
          this.timeTrendChart.options.high = 100; // Pourcentage max
          this.timeTrendChart.options.low = 0;
        }
      } catch (error) {
        console.error("Erreur chargement time-trend:", error);
        this.generateMockTrendData();
      }
    },

    generateMockTrendData() {
      // Générer des données de tendance factices
      const start = new Date(this.dateFilters.startDate);
      const end = new Date(this.dateFilters.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const labels = [];
      const series = [[]];

      // Générer des données par semaine si période > 30 jours
      if (diffDays > 30) {
        const weeks = Math.ceil(diffDays / 7);
        for (let i = 0; i < weeks; i++) {
          const date = new Date(start);
          date.setDate(start.getDate() + (i * 7));
          labels.push(`Semaine ${i + 1}`);
          series[0].push(Math.floor(Math.random() * 100)); // Valeurs factices
        }
      } else {
        // Générer par jour
        for (let i = 0; i < Math.min(diffDays, 30); i++) {
          const date = new Date(start);
          date.setDate(start.getDate() + i);
          labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
          series[0].push(Math.floor(Math.random() * 100));
        }
      }

      this.timeTrendChart.data = { labels, series };
    },

    updateChartsData() {
      this.updatePerformanceChart();
      this.updateAbsenceDistributionChart();
      this.updateTopEmployeesChart();
      this.updateLateVsAbsenceChart();
    },

    updatePerformanceChart() {
      if (this.filtered_data.data?.employees) {
        const employees = this.filtered_data.data.employees;
        this.performanceChart.data.labels = employees.map(emp =>
          this.getShortName(emp.employeeId)
        );

        this.performanceChart.data.series = [
          employees.map(emp => emp.totalScore)
        ];

        // Ajuster l'échelle
        const scores = employees.map(emp => emp.totalScore);
        const minScore = scores.length > 0 ? Math.min(...scores) : -400;
        const maxScore = scores.length > 0 ? Math.max(...scores) : 0;

        this.performanceChart.options.low = minScore - 10;
        this.performanceChart.options.high = maxScore + 10;
      }
    },

    updateAbsenceDistributionChart() {
      if (this.filtered_data.data?.employees) {
        const employees = this.filtered_data.data.employees;

        this.absenceDistributionChart.data.labels = employees.map(
          emp => this.getShortName(emp.employeeId)
        );
        this.absenceDistributionChart.data.series = employees.map(
          emp => emp.totalAbsence
        );
      }
    },
    handleCustomDateChange() {
      // S'assurer que la période reste sur 'custom'
      this.dateFilters.period = 'custom';
    },

    handlePeriodChange(period) {
      console.log('Period changed to:', period); // Pour déboguer
      this.dateFilters.period = period;

      if (period !== 'custom') {
        const dateRange = this.getDateRangeForPeriod(period);
        this.dateFilters.startDate = dateRange.startDate;
        this.dateFilters.endDate = dateRange.endDate;

        // Recharger les données avec le nouveau filtre
        this.refreshDashboard();
      }
      // Si period === 'custom', on ne fait rien automatiquement
      // L'utilisateur doit choisir les dates et cliquer sur "Appliquer"
    },

    updateTopEmployeesChart() {
      if (this.ranking_data.data?.ranking) {
        const ranking = this.ranking_data.data.ranking;
        this.topEmployeesChart.data.labels = ranking.map(emp =>
          this.getEmployeeName(emp.employeeId)
        );
        this.topEmployeesChart.data.series = [
          ranking.map(emp => emp.totalScore)
        ];
      }
    },

    updateLateVsAbsenceChart() {
      if (this.filtered_data.data?.summary) {
        this.lateVsAbsenceChart.data.series = [
          [
            this.filtered_data.data.summary.totalLates || 0,
            this.filtered_data.data.summary.totalAbsences || 0
          ]
        ];

        const maxValue = Math.max(
          this.filtered_data.data.summary.totalLates || 0,
          this.filtered_data.data.summary.totalAbsences || 0
        );
        this.lateVsAbsenceChart.options.high = maxValue + 10;
      }
    },

    getEmployeeName(employeeId) {
      if (this.ranking_data.data?.ranking) {
        const employee = this.ranking_data.data.ranking.find(
          emp => emp.employeeId === employeeId
        );
        if (employee && employee.employeeName) {
          return employee.employeeName.split(' ')[0];
        }
      }

      if (this.filtered_data.data?.employees) {
        const employee = this.filtered_data.data.employees.find(
          emp => emp.employeeId === employeeId
        );
        if (employee && employee.employeeName) {
          return employee.employeeName.split(' ')[0];
        }
      }

      return `Emp ${employeeId.slice(-4)}`;
    },

    getShortName(employeeId) {
      const name = this.getEmployeeName(employeeId);
      return name.length > 8 ? name.substring(0, 6) + '...' : name;
    },

    formatNumber(num) {
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    },

    getPerformanceClass(score) {
      if (score > -100) return 'success';
      if (score > -200) return 'warning';
      return 'danger';
    },
 toggleSeries(seriesType) {
    console.log('Toggle series:', seriesType);
    
    // Implémentation basique
    switch(seriesType) {
      case 'presence':
        alert('Afficher seulement la présence');
        break;
      case 'absence':
        alert('Afficher seulement les absences');
        break;
      case 'late':
        alert('Afficher seulement les retards');
        break;
    }
  },
    getPerformancePercentage(score) {
      return Math.max(0, Math.min(100, ((score + 400) / 4)));
    },

    refreshDashboard() {
      this.isLoading = true;
      this.loadDashboardData().then(() => {
        this.updateChartsData();
        this.isLoading = false;
      });
    },

    // Formatter la période pour l'affichage
    formatPeriodDisplay() {
      if (this.dateFilters.period === 'custom') {
        return `Du ${this.formatDateDisplay(this.dateFilters.startDate)} au ${this.formatDateDisplay(this.dateFilters.endDate)}`;
      }

      const option = this.periodOptions.find(opt => opt.value === this.dateFilters.period);
      return option ? option.label : 'Personnalisé';
    },

    formatDateDisplay(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  },

  computed: {
    totalEmployees() {
      return this.global_stats.data.totalEmployees || 0;
    },

    bestEmployee() {
      return this.global_stats.data.bestEmployee || {};
    },

    worstEmployee() {
      return this.global_stats.data.worstEmployee || {};
    },

    averageScore() {
      return this.global_stats.data.averageScorePerEmployee || '0';
    },

    // Calculer le nombre de jours dans la période
    periodDays() {
      const start = new Date(this.dateFilters.startDate);
      const end = new Date(this.dateFilters.endDate);
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
  }
};
</script>
<style scoped>
.stats-card {
  transition: transform 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-5px);
}

.icon-success,
.icon-warning,
.icon-danger,
.icon-info {
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
}

.icon-success {
  background: rgba(76, 175, 80, 0.15);
  color: #4caf50;
}

.icon-warning {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

.icon-danger {
  background: rgba(244, 67, 54, 0.15);
  color: #f44336;
}

.icon-info {
  background: rgba(33, 150, 243, 0.15);
  color: #2196f3;
}

.stat-card {
  padding: 20px;
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: #e9ecef;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stat-title {
  color: #6c757d;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
}

.stat-value {
  font-weight: bold;
  margin: 0;
  font-size: 1.8rem;
}

.badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
}

.badge-success {
  background: #4caf50;
}

.badge-warning {
  background: #ffc107;
}

.badge-info {
  background: #2196f3;
}

.badge-danger {
  background: #f44336;
}

.badge-secondary {
  background: #6c757d;
}

.table th {
  font-weight: 600;
  color: #495057;
  border-top: none;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  vertical-align: middle;
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, .02);
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, .075);
  margin-bottom: 30px;
}

.card-header {
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, .125);
  padding: 1rem 1.25rem;
}

.progress {
  background-color: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar {
  border-radius: 10px;
}

.bg-success {
  background-color: #4caf50 !important;
}

.bg-warning {
  background-color: #ffc107 !important;
}

.bg-danger {
  background-color: #f44336 !important;
}

.bg-info {
  background-color: #2196f3 !important;
}

.text-success {
  color: #4caf50 !important;
}

.text-warning {
  color: #ffc107 !important;
}

.text-danger {
  color: #f44336 !important;
}

.text-info {
  color: #2196f3 !important;
}

/* Style pour les boutons de période */
.btn-group-toggle .btn {
  padding: 8px 15px;
  font-size: 0.85rem;
}

.btn-group-toggle .btn.active {
  background-color: #2196f3;
  color: white;
  border-color: #2196f3;
}

/* Style pour les cartes de stats */
.stats-card .card-footer {
  background: rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 0.85rem;
}

/* Style pour le sélecteur de dates */
.date-filter-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

/* Animation pour le chargement */
.fa-spin {
  animation: fa-spin 2s infinite linear;
}

@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .btn-group-toggle {
    flex-wrap: wrap;
  }

  .btn-group-toggle .btn {
    margin-bottom: 5px;
    flex: 1 0 auto;
  }

  .date-filter-container .row>div {
    margin-bottom: 10px;
  }
}

/* Style pour les badges de période */
.period-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  background: #e3f2fd;
  color: #1976d2;
  font-size: 0.75rem;
  margin-left: 10px;
}

/* Hover effects */
.card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.card {
  transition: all 0.2s ease;
}

/* Style pour les inputs date */
input[type="date"] {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
}

input[type="date"]:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, .25);
}

/* Alert info */
.alert-info {
  background-color: #e3f2fd;
  border-color: #bbdefb;
  color: #1976d2;
}

/* Table responsive */
.table-responsive {
  border-radius: 8px;
  overflow: hidden;
}
</style>
