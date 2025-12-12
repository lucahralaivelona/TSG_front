<template>
  <div class="content">
    <div class="container-fluid">
      <div class="row">
        <main :class="$style.table" :scrollable="true">
          <div :class="$style.table__header">
            <h2 style="text-align: center;">Scoring pour {{ member.firstName + " " + member.lastName }}</h2>
          </div>

          <!-- Section des statistiques récapitulatives -->
          <div class="row mb-4" v-if="scoringData && scoringData.length > 0">
            <div class="col-md-12">
              <div :class="$style.statsContainer">
                <!-- Carte 1: Score Total -->
                <div :class="$style.statCard">
                  <div :class="$style.statIcon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <i class="fas fa-star"></i>
                  </div>
                  <div :class="$style.statContent">
                    <div :class="$style.statValue">{{ totalScore }}</div>
                    <div :class="$style.statLabel">Score Total</div>
                  </div>
                </div>

                <!-- Carte 2: Nombre de jours -->
                <div :class="$style.statCard">
                  <div :class="$style.statIcon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                    <i class="fas fa-calendar-alt"></i>
                  </div>
                  <div :class="$style.statContent">
                    <div :class="$style.statValue">{{ scoringData.length }}</div>
                    <div :class="$style.statLabel">Jours travaillés</div>
                  </div>
                </div>

                <!-- Carte 3: Retards -->
                <div :class="$style.statCard">
                  <div :class="$style.statIcon" style="background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);">
                    <i class="fas fa-clock"></i>
                  </div>
                  <div :class="$style.statContent">
                    <div :class="$style.statValue">{{ totalDelays }}</div>
                    <div :class="$style.statLabel">Retards</div>
                  </div>
                </div>

                <!-- Carte 4: Score Moyen -->
                <div :class="$style.statCard">
                  <div :class="$style.statIcon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                    <i class="fas fa-chart-line"></i>
                  </div>
                  <div :class="$style.statContent">
                    <div :class="$style.statValue">{{ averageScore.toFixed(1) }}</div>
                    <div :class="$style.statLabel">Score Moyen/Jour</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section principale avec tableau et calendriers -->
          <div class="row">
            <!-- Tableau des check-ins (50%) -->
            <div class="col-md-6">
              <div :class="$style.tableSection">
                <div :class="$style.sectionHeader">
                  <h3><i class="fas fa-list-alt"></i> Détails des Check-ins</h3>
                  <span :class="$style.badge">{{ scoringData ? scoringData.length : 0 }} entrées</span>
                </div>
                
                <div :class="$style.tableWrapper">
                  <table :class="$style.dataTable">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Entrée</th>
                        <th>Sortie</th>
                        <th>Pause Matin</th>
                        <th>Score</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="!scoringData || scoringData.length === 0">
                        <td colspan="6" :class="$style.noData">
                          <i class="fas fa-inbox"></i>
                          <span>Aucune donnée disponible</span>
                        </td>
                      </tr>
                      <tr v-for="(item, index) in scoringData" :key="item._id">
                        <td :class="$style.dateCell">
                          {{ formatDisplayDate(item.date) }}
                        </td>
                        <td>
                          <div :class="$style.timeSlot">
                            <i class="fas fa-sign-in-alt" :class="$style.checkinIcon"></i>
                            {{ formatTime(item.details.checkIn) }}
                          </div>
                        </td>
                        <td>
                          <div :class="$style.timeSlot">
                            <i class="fas fa-sign-out-alt" :class="$style.checkoutIcon"></i>
                            {{ formatTime(item.details.checkOut) }}
                          </div>
                        </td>
                        <td>
                          <div v-if="item.details.morningPause" :class="$style.pauseInfo">
                            <div>
                              <i class="fas fa-coffee"></i> 
                              {{ formatTime(item.details.morningPause.out) }}
                            </div>
                            <div>
                              <i class="fas fa-undo"></i> 
                              {{ formatTime(item.details.morningPause.back) }}
                            </div>
                          </div>
                          <div v-else :class="$style.noPause">
                            <i class="fas fa-ban"></i> Aucune
                          </div>
                        </td>
                        <td>
                          <span :class="getScoreClass(item.score)">
                            {{ item.score }}
                          </span>
                        </td>
                        <td>
                          <button :class="$style.detailBtn" @click="showDetails(item)">
                            <i class="fas fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Section calendriers et profil (50%) -->
            <div class="col-md-6">
              <!-- Calendriers (au-dessus) -->
              <div class="row">
                <div class="col-md-12">
                  <div class="row" style="justify-content: space-between;">
                    <!-- Calendrier de début -->
                    <div class="col-md-6">
                      <div class="event-panel">
                        <div class="event-header">
                          <div class="event-date" id="event-date">Date de début</div>
                          <i class="fas fa-calendar-alt event-icon"></i>
                        </div>
                      </div>
                      <div :class="$style.container">
                        <div :class="$style['calendar-container']">
                          <!-- ... votre calendrier existant ... -->
                        </div>
                      </div>
                    </div>

                    <!-- Calendrier de fin -->
                    <div class="col-md-6">
                      <!-- ... votre calendrier de fin existant ... -->
                    </div>
                  </div>

                  <!-- Indicateur de chargement -->
                  <div class="row mt-3">
                    <div class="col-md-12 text-center">
                      <div v-if="isLoading" :class="$style.loadingIndicator">
                        <i class="fas fa-spinner fa-spin"></i> Chargement des scores...
                      </div>
                      
                      <div v-if="scoringData && !isLoading" :class="$style.resultsInfo">
                        <i class="fas fa-check-circle" :class="$style.successIcon"></i>
                        {{ scoringData.length }} jour(s) chargé(s)
                      </div>
                      
                      <div v-if="!startDate" :class="$style.warningMessage">
                        <i class="fas fa-exclamation-triangle"></i> Veuillez sélectionner une date de début
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Carte profil (en-dessous) -->
              <div class="row mt-4">
                <div class="col-md-12">
                  <div :class="$style.rowStyle">
                    <div v-if="member" :class="['member-card', getClassForDepartment(member.departmentId._id)]">
                      <!-- ... votre carte profil existante ... -->
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>