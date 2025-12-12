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
                  <div :class="$style.statIcon" style="background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);">
                    <i class="fas fa-user-times"></i> <!-- Icône d'absence -->
                  </div>
                  <div :class="$style.statContent">
                    <div :class="$style.statValue">{{ totalAbsences || 0 }}</div>
                    <div :class="$style.statLabel">Jours d'absence</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section principale avec tableau et calendriers -->
          <div class="row">
            <!-- Tableau des check-ins (6 colonnes) -->
            <div class="col-md-7">
              <div class="row" style="justify-content: space-between;margin: auto;">
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
                      <div :class="$style['calendar-header']">
                        <div :class="$style['nav-buttons']">
                          <button :class="$style['nav-btn']" @click="prevMonth('startDate')"><i
                              class="fas fa-chevron-left"></i></button>
                          <button :class="$style['nav-btn']" @click="nextMonth('startDate')"><i
                              class="fas fa-chevron-right"></i></button>
                        </div>
                        <div :class="$style['month-year']">{{ monthYearStart }}</div>
                      </div>
                      <!-- Affichage des jours -->
                      <div :class="$style.days">
                        <div v-for="(day, index) in daysStart" :key="index" :class="[$style.day, day.class]"
                          @click="selectStartDate(day.date)">
                          {{ day.date.getDate() }}
                        </div>
                      </div>
                      <div :class="$style['calendar-footer']">
                        <button :class="$style['today-btn']" @click="setToday"><i class="fas fa-calendar-day"></i>
                          Aujourd'hui</button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Calendrier de fin -->
                <div class="col-md-6">
                  <div class="event-panel">
                    <div class="event-header">
                      <div class="event-date" id="event-date">
                        <label :class="$style.checkboxLabel">
                          <input type="checkbox" v-model="useEndDate" @change="handleEndDateToggle"
                            :class="$style.checkboxInput">
                          Date de fin
                        </label>
                      </div>
                      <i class="fas fa-calendar-alt event-icon"></i>
                    </div>
                  </div>

                  <div v-if="useEndDate" :class="$style.container">
                    <div :class="$style['calendar-container']">
                      <div :class="$style['calendar-header']">
                        <div :class="$style['nav-buttons']">
                          <button :class="$style['nav-btn']" @click="prevMonth('endDate')"><i
                              class="fas fa-chevron-left"></i></button>
                          <button :class="$style['nav-btn']" @click="nextMonth('endDate')"><i
                              class="fas fa-chevron-right"></i></button>
                        </div>
                        <div :class="$style['month-year']">{{ monthYearEnd }}</div>
                      </div>
                      <!-- Affichage des jours -->
                      <div :class="$style.days">
                        <div v-for="(day, index) in daysEnd" :key="index" :class="[$style.day, day.class]"
                          @click="selectEndDate(day.date)">
                          {{ day.date.getDate() }}
                        </div>
                      </div>
                      <div :class="$style['calendar-footer']">
                        <button :class="$style['today-btn']" @click="setTodayEnd"><i class="fas fa-calendar-day"></i>
                          Aujourd'hui</button>
                      </div>
                    </div>
                  </div>

                  <div v-else :class="$style.noEndDateMessage">
                    <p>Sélectionnez cette case pour définir une date de fin</p>
                  </div>
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

            <!-- Section calendriers et profil (6 colonnes) -->
            <div class="col-md-5">
              <!-- Carte profil (en-dessous) -->
              <div class="">
                <div class="col-md-12">
                  <div style="margin: auto;">
                    <div v-if="member" :class="['member-card', getClassForDepartment(member.departmentId._id)]">
                      <!-- Profile Image -->
                      <div :class="$style.employeeImage">
                        <img :class="$style.employeeProfileImg" :src="'http://localhost:5000' + member.employeeImage"
                          alt="Profile Image" />
                        <span :class="$style.statusActive"></span>
                      </div>

                      <!-- Profile Details -->
                      <div :class="$style.employeeTextData">
                        <span :class="$style.employeeName">{{ member.firstName + " " + member.lastName }}</span>
                        <span :class="$style.employeeJob">{{ member.departmentId.name }}</span>
                        <span :class="$style.employeeJob">Id checkin : {{ member.deviceUserId }}</span>

                        <div :class="$style.contactInfo">
                          <div :class="$style.leftText">{{ member.phone }}</div>
                          <div :class="$style.separator"></div>
                          <div :class="$style.rightText">{{ member.position }}</div>
                        </div>
                      </div>

                      <!-- Buttons -->
                      <div :class="$style.employeeButtons">
                        <button :class="$style.employeeButtonModification">Plus d'info...</button>
                      </div>

                      <!-- Analytics -->
                      <div :class="$style.employeeAnalytics">
                        <div :class="$style.employeeData">
                          <i :class="['nc-icon', 'nc-time-alarm', $style['delay-icon']]"></i>
                          <span :class="$style.employeeNumber">60k</span>
                        </div>
                        <div :class="$style.employeeData">
                          <i :class="['nc-icon', 'nc-simple-remove', $style['absence-icon']]"></i>
                          <span :class="$style.employeeNumber">12k</span>
                        </div>
                        <div :class="$style.employeeData">
                          <i :class="['nc-icon', 'nc-chart-bar-32', $style['accuracy-icon']]"></i>
                          <span :class="$style.employeeNumber">20k</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
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
                          {{ item.score || 0 }}
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
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: ['id'],
  data() {
    return {
      employeeDetails: {
        firstName: "",
        lastName: "",
        phone: " ",
        deviceUserId: "",
        departmentId: "",
        position: "",
        hireDate: "",
        status: "",
        defaultImage: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
      },
      currentDate: new Date(),
      startDate: new Date(), // Initialisé avec aujourd'hui
      endDate: null,
      member: null,
      departments: [],
      totalValueData: [],
      days: [],
      daysStart: [],
      daysEnd: [],
      useEndDate: false,
      scoringData: null,
      isLoading: false, // Pour afficher un indicateur de chargement
    };
  },

  mounted() {
    this.getMemberById();
    this.renderCalendar('startDate');
    // Dès le montage, on récupère les données pour aujourd'hui
    this.getScoringData();
    this.getClassForDepartment();
  },

  computed: {
    monthYearStart() {
      const months = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
      ];
      return this.startDate ? `${months[this.startDate.getMonth()]} ${this.startDate.getFullYear()}` : '';
    },
    monthYearEnd() {
      const months = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
      ];
      return this.endDate ? `${months[this.endDate.getMonth()]} ${this.endDate.getFullYear()}` : '';
    },
    totalScore() {
      if (!this.scoringData || this.scoringData.length === 0) return 0;
      return this.scoringData.reduce((sum, item) => sum + item.score, 0);
    },

    totalDelays() {
      if (!this.scoringData || this.scoringData.length === 0) return 0;
      return this.scoringData.reduce((sum, item) => {
        return sum + (item.details.breakdown.latePenalty < 0 ? 1 : 0);
      }, 0);
    },

    totalAbsences() {
      if (!this.scoringData || this.scoringData.length === 0) return 0;
      try {
        return this.scoringData.reduce((count, item) => {
          // Deux cas d'absences :
          // 1. Score de -10 (pénalité d'absence)
          // 2. Présence du champ "reason: 'absent'" dans details
          const isAbsent =
            item.score === -10 ||
            (item.details && item.details.reason === 'absent');

          return isAbsent ? count + 1 : count;
        }, 0);
      } catch (error) {
        console.error('Erreur dans totalAbsences:', error);
        return 0;
      }
    },

  },
  computed: {
    monthYearStart() {
      const months = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
      ];
      return this.startDate ? `${months[this.startDate.getMonth()]} ${this.startDate.getFullYear()}` : '';
    },
    monthYearEnd() {
      const months = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
      ];
      return this.endDate ? `${months[this.endDate.getMonth()]} ${this.endDate.getFullYear()}` : '';
    },

    totalScore() {
      if (!this.scoringData || this.scoringData.length === 0) return 0;
      try {
        return this.scoringData.reduce((sum, item) => {
          // Vérifiez que item.score existe (peut être null ou undefined)
          const score = item.score || 0;
          return sum + score;
        }, 0);
      } catch (error) {
        console.error('Erreur dans totalScore:', error);
        return 0;
      }
    },

    totalDelays() {
      if (!this.scoringData || this.scoringData.length === 0) return 0;
      try {
        return this.scoringData.reduce((sum, item) => {
          // Vérifiez chaque niveau d'accès
          const breakdown = item.details?.breakdown;

          // Si breakdown n'existe pas ou latePenalty n'existe pas
          if (!breakdown || typeof breakdown.latePenalty === 'undefined') {
            return sum;
          }

          // Comptez comme retard si latePenalty est négatif
          return sum + (breakdown.latePenalty < 0 ? 1 : 0);
        }, 0);
      } catch (error) {
        console.error('Erreur dans totalDelays:', error);
        return 0;
      }
    },
    // ⭐⭐ AJOUTEZ totalAbsences ICI ⭐⭐
    totalAbsences() {
      if (!this.scoringData || this.scoringData.length === 0) return 0;
      try {
        return this.scoringData.reduce((count, item) => {
          // Deux cas d'absences :
          // 1. Score de -10 (pénalité d'absence)
          // 2. Présence du champ "reason: 'absent'" dans details
          const isAbsent =
            item.score === -10 ||
            (item.details && item.details.reason === 'absent');

          return isAbsent ? count + 1 : count;
        }, 0);
      } catch (error) {
        console.error('Erreur dans totalAbsences:', error);
        return 0;
      }
    },


    averageScore() {
      if (!this.scoringData || this.scoringData.length === 0) return 0;
      try {
        return this.scoringData.length > 0 ? (this.totalScore / this.scoringData.length).toFixed(1) : 0;
      } catch (error) {
        console.error('Erreur dans averageScore:', error);
        return 0;
      }
    }
  },
  methods: {
    getMemberById() {
      axios.get(`https://tsg-back.onrender.com/api/employees/${this.id}`)
        .then(response => {
          this.member = response.data;
          console.log("Employé :", response.data);
        })
        .catch(err => console.error(err));
    },

    getClassForDepartment(departmentId) {
      console.log("Département ID reçu :", departmentId);
      if (departmentId === "6929a0fc63f61c75f6e134b9") {
        console.log("Renvoi de la classe : employeeProfileCardMachiniste");
        return this.$style.employeeProfileCardMachiniste;
      } else if (departmentId === "692b8529afa8de4eac602eeb") {
        console.log("Renvoi de la classe : employeeProfileCardControle");
        return this.$style.employeeProfileCardControle;
      } else if (departmentId === "692b850cafa8de4eac602ee9") {
        console.log("Renvoi de la classe : employeeProfileCardBroderie");
        return this.$style.employeeProfileCardBroderie;
      } else if (departmentId === "692b8536afa8de4eac602eed") {
        console.log("Renvoi de la classe : employeeProfileCardChefAtelier");
        return this.$style.employeeProfileCardChefAtelier;
      } else {
        console.log("Renvoi de la classe par défaut");
        return this.$style.employeeProfileCard;
      }
    },

    renderCalendar(calendarType = 'startDate') {
      let targetDate = calendarType === 'startDate' ? this.startDate : this.endDate;
      let daysArray = calendarType === 'startDate' ? this.daysStart : this.daysEnd;

      if (!targetDate) {
        targetDate = new Date();
      }

      const firstDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const lastDay = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
      const prevLastDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);

      const firstDayIndex = firstDay.getDay();
      const lastDayIndex = lastDay.getDay();
      const nextDays = 7 - lastDayIndex - 1;

      let days = [];

      // Jours du mois précédent
      for (let x = firstDayIndex; x > 0; x--) {
        const prevDate = prevLastDay.getDate() - x + 1;
        days.push({
          date: new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, prevDate),
          class: 'other-month'
        });
      }

      // Jours du mois actuel
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(targetDate.getFullYear(), targetDate.getMonth(), i);
        let dayClass = '';

        // Jour sélectionné
        if (
          calendarType === 'startDate' &&
          this.startDate &&
          date.getDate() === this.startDate.getDate() &&
          date.getMonth() === this.startDate.getMonth() &&
          date.getFullYear() === this.startDate.getFullYear()
        ) {
          dayClass = 'selected';
        } else if (
          calendarType === 'endDate' &&
          this.endDate &&
          date.getDate() === this.endDate.getDate() &&
          date.getMonth() === this.endDate.getMonth() &&
          date.getFullYear() === this.endDate.getFullYear()
        ) {
          dayClass = 'selected';
        }

        // Aujourd'hui
        if (
          date.getDate() === new Date().getDate() &&
          date.getMonth() === new Date().getMonth() &&
          date.getFullYear() === new Date().getFullYear()
        ) {
          dayClass = 'today';
        }

        days.push({ date, class: dayClass });
      }

      // Jours du mois suivant
      for (let j = 1; j <= nextDays; j++) {
        days.push({
          date: new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, j),
          class: 'other-month'
        });
      }

      // Mettre à jour les jours
      if (calendarType === 'startDate') {
        this.daysStart = days;
      } else {
        this.daysEnd = days;
      }
    },

    selectStartDate(date) {
      this.startDate = date;
      this.renderCalendar('startDate');
      // Recherche automatique
      this.getScoringData();
    },

    selectEndDate(date) {
      this.endDate = date;
      this.renderCalendar('endDate');
      // Recherche automatique
      this.getScoringData();
    },

    handleEndDateToggle() {
      if (this.useEndDate && !this.endDate) {
        // Si on active la case mais qu'aucune date n'est définie
        this.endDate = new Date();
        this.renderCalendar('endDate');
        // Recherche automatique avec la nouvelle date de fin
        this.getScoringData();
      } else if (!this.useEndDate) {
        this.endDate = null;
        // Recherche automatique sans date de fin
        this.getScoringData();
      }
    },

    // Méthode pour récupérer les scores
    getScoringData() {
      if (!this.startDate) {
        console.error("Date de début requise");
        return;
      }

      this.isLoading = true; // Début du chargement

      const startDateFormatted = this.formatDate(this.startDate);
      let url = '';

      if (this.useEndDate && this.endDate) {
        const endDateFormatted = this.formatDate(this.endDate);
        // URL avec range de dates
        url = `https://tsg-back.onrender.com/api/scores/compute/${this.id}/scores?startDate=${startDateFormatted}&endDate=${endDateFormatted}`;
        console.log('URL avec range:', url);
      } else {
        // URL avec une seule date
        url = `https://tsg-back.onrender.com/api/scores/compute/${this.id}/scores?startDate=${startDateFormatted}&endDate=${startDateFormatted}`;

        console.log('URL simple:', url);
      }

      axios.get(url)
        .then(response => {
          console.log('Données de scoring récupérées:', response.data);
          this.scoringData = response.data;
          // Traitez les données ici...
          // Par exemple : this.processScoringData(response.data);
        })
        .catch(error => {
          console.error('Erreur lors de la récupération des données de scoring:', error);
        })
        .finally(() => {
          this.isLoading = false; // Fin du chargement
        });
    },

    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    prevMonth(type) {
      if (type === 'startDate') {
        this.startDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth() - 1, 1);
      } else if (type === 'endDate' && this.endDate) {
        this.endDate = new Date(this.endDate.getFullYear(), this.endDate.getMonth() - 1, 1);
      }
      this.renderCalendar(type);
      // On ne fait PAS de recherche automatique ici car on change juste le mois
    },

    nextMonth(type) {
      if (type === 'startDate') {
        this.startDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth() + 1, 1);
      } else if (type === 'endDate' && this.endDate) {
        this.endDate = new Date(this.endDate.getFullYear(), this.endDate.getMonth() + 1, 1);
      }
      this.renderCalendar(type);
      // On ne fait PAS de recherche automatique ici car on change juste le mois
    },

    setToday() {
      const today = new Date();
      this.startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      this.renderCalendar('startDate');
      // Recherche automatique
      this.getScoringData();
    },

    setTodayEnd() {
      const today = new Date();
      this.endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      this.renderCalendar('endDate');
      // Recherche automatique
      this.getScoringData();
    },
    formatDisplayDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
      });
    },

    formatTime(dateTimeString) {
      if (!dateTimeString) return '--:--';
      const parts = dateTimeString.split(' ');
      if (parts.length > 1) {
        return parts[1].substring(0, 5); // Retourne seulement HH:MM
      }
      return dateTimeString.substring(11, 16);
    },

    getScoreClass(score) {
      if (score === 0) return this.$style.scoreNeutral;
      if (score > 0) return this.$style.scorePositive;
      return this.$style.scoreNegative;
    }, getScoreClass(score) {
      // Gérer les valeurs null/undefined
      const scoreValue = score || 0;
      if (scoreValue === 0) return this.$style.scoreNeutral;
      if (scoreValue > 0) return this.$style.scorePositive;
      return this.$style.scoreNegative;
    },

    showDetails(item) {
      // Vous pouvez implémenter une modal ici
      console.log('Détails:', item);
      alert(`Détails pour le ${item.date}\nScore: ${item.score}\nEntrée: ${this.formatTime(item.details.checkIn)}\nSortie: ${this.formatTime(item.details.checkOut)}`);
    }
  }
};
</script>
<style>
.today {
  background: #df9bb3;
  color: white;
  font-weight: bold;
}

.selected {
  background: #4ec3ff;
  color: white;
  font-weight: bold;
  animation: pop 0.3s ease;
}

.selected:hover {
  background: #4ec3ff;
  color: white;
  font-weight: bold;
  animation: pop 0.3s ease;
}

.other-month {
  color: #636e72;
  opacity: 0.5;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.1rem;
  padding-bottom: 1rem;
  border-bottom: 4px solid rgba(74, 107, 223, 0.2);
}

.event-date {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary);
}

.event-icon {
  font-size: 1.2rem;
  color: var(--accent);
  margin-right: 10px;
}

.event-panel {

  border-radius: 20px;
  padding: 1.5rem;
  padding-bottom: 15px;
  width: 100%;
  height: fit-content;
}
</style>
<style module scoped>
.checkboxLabel {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary);
}

.checkboxInput {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #4a6bdf;
  /* Couleur personnalisée pour la case */
}

.checkboxInput:checked {
  background-color: #4a6bdf;
}

.noEndDateMessage {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  margin-top: 10px;
  color: #6c757d;
  font-style: italic;
}

/* Optionnel: Ajouter un bouton pour récupérer les données */
.refreshButton {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #4a6bdf;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.refreshButton:hover {
  background-color: #3a5bcf;
}

.accuracy-icon {
  font-weight: bold;
  /* rend l’icône “plus épaisse” */
  color: green;
  /* couleur de l’icône */
  font-size: 24px;
  /* taille si besoin */
}

.delay-icon {
  font-weight: bold;
  color: orange;
  font-size: 24px;
}

.absence-icon {
  font-weight: bold;
  color: red;
  font-size: 24px;
}


main.table {


  background-color: #fff5;
  width: 100%;
  backdrop-filter: blur(7px);
  box-shadow: 0 0.4rem 0.8rem #0005;
  border-radius: 0.8rem;

  overflow-y: hidden !important;
  overflow-x: hidden;
}

.employeeProfileCard {
  display: flex;
  margin: 10px;
  flex-direction: column;
  align-items: center;
  max-width: 370px;
  width: 100%;
  background: #fff;
  border-radius: 24px;
  padding: 25px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  margin: auto;
}

.fadeOut {
  opacity: 0;
  height: 0;
  overflow: hidden;
  padding: 0 !important;
  margin: 0 !important;
  translate: transformX(100%);
  transition: all 0.3s ease;
}

.employeeProfileCardBroderie {
  display: flex;
  margin: 10px;
  flex-direction: column;
  align-items: center;
  max-width: 370px;
  width: 100%;
  background: #fff;
  border-radius: 24px;
  padding: 25px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  max-height: 460px;
  margin: 30px;
}

.employeeProfileCardMachiniste {
  display: flex;
  margin: 10px;
  flex-direction: column;
  align-items: center;
  max-width: 370px;
  width: 100%;
  background: #fff;
  border-radius: 24px;
  padding: 25px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  max-height: 460px;
  margin: 30px;

}

.employeeProfileCardChefAtelier {
  display: flex;
  margin: 10px;
  flex-direction: column;
  align-items: center;
  max-width: 370px;
  width: 100%;
  background: #fff;
  border-radius: 24px;
  padding: 25px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  max-height: 460px;
  margin: 30px;

}

.employeeProfileCardControle {
  display: flex;
  margin: 10px;
  flex-direction: column;
  align-items: center;
  max-width: 370px;
  width: 100%;
  background: #fff;
  border-radius: 24px;
  padding: 25px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  max-height: 460px;
  margin: 30px;

}

.employeeProfileCardControle::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 36%;
  width: 100%;
  border-radius: 24px 24px 0 0;
  background-image: url('images/controle.jpg');
  background-size: cover;
  background-position: center;

}

.employeeProfileCard::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 36%;
  width: 100%;
  border-radius: 24px 24px 0 0;
  /* background-color: #4070f4; */
  background-size: cover;
  background-position: center;

}

.employeeProfileCardBroderie::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 36%;
  width: 100%;
  border-radius: 24px 24px 0 0;
  background-image: url('images/broderie.png');
  background-size: cover;
  background-position: center;

}

.employeeProfileCardMachiniste::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 36%;
  width: 100%;
  border-radius: 24px 24px 0 0;
  background-image: url('images/machiniste.jpg');
  background-size: cover;
  background-position: center;

}

.employeeProfileCardChefAtelier::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 36%;
  width: 100%;
  border-radius: 24px 24px 0 0;
  background-image: url('images/chefAtelier.png');
  background-size: cover;
  background-position: center;

}

.contactInfo {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  /* centre sur la ligne */
  gap: 10px;
  /* espace entre les éléments et le séparateur */
  font-size: 14px;
  color: #555;
  flex-wrap: wrap;
  width: 100%;
  /* limite la largeur pour éviter le débordement */

}

.rowStyle {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  overflow-y: auto;
  /* active le scroll vertical */
  overflow-x: hidden;

}

.leftText {
  max-width: 100%;
  /* largeur max avant de wrap */
  word-wrap: break-word;
  /* coupe les mots trop longs */
  text-align: center;
}

.rightText {
  max-width: 90px;
  /* largeur max avant de wrap */
  word-wrap: break-word;
  /* coupe les mots trop longs */
  text-align: center;
}


.separator {
  display: inline-block;
  width: 1px;
  /* largeur du trait */
  height: 35px;
  /* hauteur égale à la taille du texte */
  background-color: #000000;
  /* couleur du trait */
}

.h3 {
  text-align: center;

  color: #333;
}


/* Image */
.employeeImage {
  position: relative;
  height: 150px;
  width: 150px;
  border-radius: 50%;
  background-color: #4070f4;
  padding: 3px;
  margin-bottom: 10px;
}

.statusActive {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid white;
  /* bord blanc autour du cercle pour mieux voir */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white;
  background-color: #4caf50;
  /* vert */
}

.employeeProfileImg {
  height: 100%;
  width: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid #fff;
}

.loadingIndicator {
  color: #4a6bdf;
  font-weight: 500;
  padding: 10px;
  background-color: rgba(74, 107, 223, 0.1);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.resultsInfo {
  color: #28a745;
  font-weight: 500;
  padding: 10px;
  background-color: rgba(40, 167, 69, 0.1);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.successIcon {
  font-size: 1.2rem;
}

.warningMessage {
  color: #dc3545;
  font-weight: 500;
  padding: 10px;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

/* Supprimez le bouton refreshButton si vous ne l'utilisez plus */
.refreshButton {
  display: none;
}

/* Text Data */
.employeeTextData {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #333;
}

.employeeName {
  font-size: 22px;
  font-weight: 500;
  text-align: center;
}

.employeeJob {
  font-size: 15px;
  font-weight: 400;
}

/* Social Buttons */
.employeeMediaButtons {
  display: flex;
  align-items: center;
  margin-top: 15px;
}

.employeeLink {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  height: 34px;
  width: 34px;
  border-radius: 50%;
  margin: 0 8px;
  text-decoration: none;
}

/* Subscribe / Message Buttons */
.employeeButtons {
  display: flex;
  align-items: center;
  margin-top: 25px;
}

.employeeButtonModification {
  color: #fff;
  font-size: 14px;
  font-weight: 400;
  border: none;
  border-radius: 24px;
  margin: 0 10px;
  padding: 8px 24px;
  background-color: #4d9e01;
  cursor: pointer;
  transition: all 0.3s ease;
}

.employeeButtonModification:hover {
  background-color: #085a00;
}

.employeeButtonSuppression {
  color: #fff;
  font-size: 14px;
  font-weight: 400;
  border: none;
  border-radius: 24px;
  margin: 0 10px;
  padding: 8px 24px;
  background-color: #d60000ef;
  cursor: pointer;
  transition: all 0.3s ease;
}

.employeeButtonSuppression:hover {
  background-color: #a10101;
}

/* Analytics */
.employeeAnalytics {
  display: flex;
  align-items: center;
  margin-top: 25px;
}

.employeeData {
  display: flex;
  align-items: center;
  color: #333;
  padding: 0 20px;
  border-right: 2px solid #e7e7e7;
}

.employeeData:last-child {
  border-right: none;
}

.employeeNumber {
  margin-left: 5px;
  font-weight: 500;
}


.table__header {
  width: 100%;
  height: 82px;
  background-color: #fff4;
  padding: 0.8rem 1rem;

  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 3.4rem 8.8rem #0005;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 250px;
  /* Réduit la largeur maximale à 250px */
  width: 100%;
  margin: auto;
}

@media (min-width: 768px) {
  .container {
    flex-direction: row;
    align-items: flex-start;
  }
}

.calendar-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 300px;
  /* Réduit la largeur maximale à 250px */
  overflow: hidden;
  transform-style: preserve-3d;
  perspective: 1000px;
  transition: all 0.3s ease;
}

.calendar-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.calendar-header {
  background: linear-gradient(135deg, #4a6bdf 0%, #6c5ce7 100%);
  color: white;
  padding: 1rem;
  /* Réduit le padding pour s'adapter à la taille plus petite */
  text-align: center;
  position: relative;
  overflow: hidden;
}

.calendar-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
  transform: rotate(30deg);
}

.month-year {
  font-size: 1.2rem;
  /* Réduit la taille de la police */
  font-weight: 600;
  margin-bottom: 0.5rem;
  position: relative;
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
  position: absolute;
  width: 100%;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  padding: 0 0.5rem;
  /* Réduit le padding des boutons de navigation */
  z-index: 1;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  width: 28px;
  /* Réduit la taille des boutons */
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 0.5rem 0.5rem;
  /* Réduit les espacements */
  background: rgba(74, 107, 223, 0.1);
  font-weight: 600;
  color: #4a6bdf;
}

.weekday {
  text-align: center;
  padding: 0.3rem;
  font-size: 0.8rem;
  /* Réduit la taille de la police */
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
  /* Réduit l'écart entre les jours */
  padding: 0.5rem;
}

.day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  font-weight: 500;
  color: #2d3436;
}

.day:hover {
  background: rgba(74, 107, 223, 0.1);
  transform: scale(1.1);
}

.day.today {
  background: var(--today);
  color: white;
  font-weight: bold;
}

.day.selected {
  background: #a29bfe;
  color: white;
  font-weight: bold;
  animation: pop 0.3s ease;
}

@keyframes pop {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}

.day.other-month {
  color: #636e72;
  opacity: 0.5;
}

.day.has-events::after {
  content: '';
  position: absolute;
  bottom: 5px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #00cec9;
}

.calendar-footer {
  padding: 0.5rem;
  text-align: center;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
}

.today-btn {
  background: linear-gradient(135deg, #00cec9 0%, #00b894 100%);
  color: white;
  border: none;
  padding: 0.3rem 0.5rem;
  /* Réduit le padding */
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.today-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 206, 201, 0.3);
}

.event-indicator {
  font-size: 0.7rem;
  /* Réduit la taille du texte */
  color: #00cec9;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Event Panel Styles */
.event-panel {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  padding-bottom: 5px !important;
  max-width: 100px;
  /* Réduit la largeur maximale à 250px */
  height: fit-content;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  /* Réduit la marge inférieure */
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(74, 107, 223, 0.2);
}

.event-date {
  font-size: 1.2rem;
  /* Réduit la taille de la date */
  font-weight: 600;
  color: #4a6bdf;
}

.event-list {
  max-height: 250px;
  /* Réduit la hauteur maximale */
  overflow-y: auto;
}

.event-item {
  padding: 0.8rem;
  /* Réduit le padding */
  margin-bottom: 0.5rem;
  /* Réduit l'espace entre les éléments */
  background: var(--event-panel-bg);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.event-item:hover {
  transform: translateX(5px);
}

.event-color {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #00cec9;
  flex-shrink: 0;
}

.event-time {
  font-weight: 600;
  color: #4a6bdf;
  min-width: 60px;
  /* Réduit la largeur minimale */
}

.event-text {
  flex: 1;
}

.no-events {
  text-align: center;
  color: #636e72;
  padding: 2rem 1rem;
  font-style: italic;
}

.event-icon {
  font-size: 1rem;
  /* Réduit la taille de l'icône */
  color: #00cec9;
  margin-right: 10px;
}

@media (max-width: 767px) {
  .container {
    gap: 10px;
    /* Réduit l'écart entre les éléments */
  }
}

/* === STATISTIQUES === */
.statsContainer {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 25px;
  margin-bottom: 5px !important;
}

.statCard {
  background: white;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.statCard:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.statIcon {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.statContent {
  flex: 1;
}

.statValue {
  font-size: 28px;
  font-weight: 700;
  color: #2d3436;
  line-height: 1;
}

.statLabel {
  font-size: 14px;
  color: #636e72;
  margin-top: 5px;
  font-weight: 500;
}

/* === TABLEAU (65%) === */
.tableSection {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
  max-height: 600px;
  /* Hauteur maximale augmentée */
  width: 60%;
  margin-top: 30px !important;
  margin-bottom: 30px !important;
  margin: auto;
}

.sectionHeader {
  padding: 20px 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sectionHeader h3 {
  margin: 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 17px;
  font-weight: 600;
}

.tableWrapper {
  flex: 1;
  overflow-y: auto;
  max-height: 520px;
  /* Hauteur augmentée pour plus de lignes */
}

.dataTable {
  width: 100%;
  border-collapse: collapse;
}

.dataTable th {
  padding: 18px 20px;
  /* Padding augmenté */
  text-align: left;
  font-weight: 600;
  color: #2d3436;
  background: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
  position: sticky;
  top: 0;
  z-index: 10;
  font-size: 17px;
  /* Taille de police légèrement augmentée */
}

.dataTable td {
  padding: 16px 20px;
  /* Padding augmenté */
  border-bottom: 1px solid #e9ecef;
  font-size: 16px;
  /* Taille de police légèrement augmentée */
}

.dataTable tbody tr {
  transition: background-color 0.2s ease;
}

.dataTable tbody tr:hover {
  background-color: #f8f9fa;
}

/* Styles des cellules - Taille augmentée */
.dateCell {
  font-weight: 600;
  color: #2d3436;
  white-space: nowrap;
  font-size: 14px;
}

.timeSlot {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Courier New', monospace;
  font-weight: 500;
  font-size: 16px;
}

.checkinIcon {
  color: #00b894;
  font-size: 14px;
}

.checkoutIcon {
  color: #e17055;
  font-size: 14px;
}

.pauseInfo {
  font-size: 16px;
  /* Taille augmentée */
}

.pauseInfo div {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 4px 0;
}

.pauseInfo div:first-child {
  color: #0984e3;
}

.pauseInfo div:last-child {
  color: #00b894;
}

.noPause {
  color: #b2bec3;
  font-style: italic;
  font-size: 13px;
}

/* Styles des scores - Taille augmentée */
.scorePositive,
.scoreNegative,
.scoreNeutral {
  display: inline-block;
  padding: 6px 12px;
  /* Padding augmenté */
  color: white;
  border-radius: 20px;
  font-weight: 600;
  min-width: 40px;
  /* Largeur augmentée */
  text-align: center;
  font-size: 16px;
}

.scorePositive {
  background: #00b894;
}

.scoreNegative {
  background: #d63031;
}

.scoreNeutral {
  background: #636e72;
}

/* Bouton détail - Taille augmentée */
.detailBtn {
  background: #74b9ff;
  color: white;
  border: none;
  width: 36px;
  /* Taille augmentée */
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 14px;
}

.detailBtn:hover {
  background: #0984e3;
  transform: scale(1.1);
}

/* Message pas de données */
.noData {
  text-align: center;
  padding: 50px !important;
  /* Padding augmenté */
  color: #b2bec3;
}

.noData i {
  font-size: 52px;
  /* Taille augmentée */
  margin-bottom: 18px;
  display: block;
}

.noData span {
  display: block;
  font-size: 16px;
}

/* === ZONE CALENDRIERS (35%) === */
/* Styles pour la partie calendrier réduite */
.calendar-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Ajustement des calendriers pour 35% */
.container {
  max-width: 100% !important;
  /* Prend toute la largeur disponible */
}

.calendar-container {
  max-width: 100% !important;
  width: 100% !important;
}

/* Ajustement de la carte employé pour espace réduit */
.rowStyle {
  max-height: 350px;
  /* Hauteur réduite pour s'adapter */
}

/* === INDICATEURS === */
.loadingIndicator {
  color: #4a6bdf;
  font-weight: 500;
  padding: 12px 20px;
  background-color: rgba(74, 107, 223, 0.1);
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 2px solid rgba(74, 107, 223, 0.2);
}

.resultsInfo {
  color: #00b894;
  font-weight: 500;
  padding: 12px 20px;
  background-color: rgba(0, 184, 148, 0.1);
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 2px solid rgba(0, 184, 148, 0.2);
}

.warningMessage {
  color: #d63031;
  font-weight: 500;
  padding: 12px 20px;
  background-color: rgba(214, 48, 49, 0.1);
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 2px solid rgba(214, 48, 49, 0.2);
}

.successIcon {
  font-size: 1.2rem;
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .statsContainer {
    grid-template-columns: repeat(2, 1fr);
  }

  .statCard {
    flex-direction: column;
    text-align: center;
  }

  .dataTable {
    display: block;
    overflow-x: auto;
  }

  .tableSection {
    max-height: none;
  }
}
</style>
