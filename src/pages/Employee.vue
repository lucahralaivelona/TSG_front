<template>
  <div class="content">
    <div class="container-fluid">
      <div class="row">
        <main :class="$style.table" :scrollable="true">
          <section :class="$style.table__header">
            <h2 style="">Liste des Employées</h2>
            <div :class="$style['input-group']">
              <input style="" type="search" placeholder="Rechercher des employées..." ref="searchInput "
                v-model="searchQuery" data-role="search-input" />
              <img src="images/search.png" alt="" />
            </div>
            <div style="align-items: center; display: flex">
              <div style="">
                <button @click="showModal" :class="$style.imgUser" title="ajouter une employée"></button>
              </div>
            </div>
          </section>


          <transition-group name="fade" tag="div" :class="['row', $style.rowStyle]">
            <div v-for="member in members" :key="member._id" v-if="matchesSearch(member)"
              :class="['member-card', getClassForDepartment(member.departmentId._id)]">
              <!-- Profile Image -->
              <div :class="$style.employeeImage">
                <img :class="$style.employeeProfileImg" :src="'http://localhost:5000' + member.employeeImage"
                  alt="Profile Image" />
                <span :class="$style.statusActive"></span>
                <!-- Pour actif, utilisez "active", pour inactif "inactive" -->
              </div>

              <!-- Profile Details -->
              <div :class="$style.employeeTextData">
                <span :class="$style.employeeName">{{ member.firstName + " " + member.lastName }}</span>
                <span :class="$style.employeeJob">{{ member.departmentId.name }}</span>
                <span :class="$style.employeeJob">Id checkin : {{ member.deviceUserId }}</span>
                <!-- <span :class="$style.employeeJob">0346937516 | Lot Ab 53 ter Ambohipanja</span> -->
                <div :class="$style.contactInfo">
                  <div :class="$style.leftText">{{ member.phone }}</div>
                  <div :class="$style.separator"></div>
                  <div :class="$style.rightText">{{ member.position }}</div>
                </div>

              </div>

              <!-- Subscribe and Message Buttons -->
              <div :class="$style.employeeButtons">
                <button @click="
                  showEditModal();
                selectMember(member);
                " :class="$style.employeeButtonModification">Modifier</button>
                <button @click="showDeletModal(); selectMember(member);"
                  :class="$style.employeeButtonSuppression">Supprimer</button>
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
          </transition-group>




          <section>
            <!--  -->
            <modal name="modifierEmployée" height="auto" :scrollable="true" :shiftX="0.4" :shiftY="0.5">
              <div class="container">
                <div class="title">Modifier un employéé</div>
                <form>
                  <div class="user-details">
                    <div class="input-box">
                      <span class="details">Nom</span>
                      <input type="text" placeholder="Entrer le nom" required v-model="clickMember.firstName" />
                    </div>
                    <div class="input-box">
                      <span class="details">Prénom</span>
                      <input type="text" placeholder="Entrer le prénom" required v-model="clickMember.lastName" />
                    </div>
                    <div class="input-box">
                      <span class="details">Numéro téléphone</span>
                      <input type="text" placeholder="Entrer le numéro de téléphone" required
                        v-model="clickMember.phone" />
                    </div>
                    <div class="input-box">
                      <span class="details">Adresse</span>
                      <input type="text" placeholder="Entrer l'adresse" required v-model="clickMember.position" />
                    </div>
                    
                    <div class="input-box">
                      <span class="details">Identifiant Checkin</span>
                      <select v-model="clickMember.deviceUserId" required>
                        <option disabled value="">Sélectionnez un ID disponible</option>
                        <option v-for="u in availableUsers" :key="u.userId" :value="u.userId">
                          {{ u.userId }} - {{ u.name }}
                        </option>
                      </select>

                    </div>


                    <div class="input-box">
                      <span class="details">Département</span>
                      <select v-model="clickMember.departmentId" required>
                        <option value="" disabled selected>Choisir un département</option>
                        <!-- Liste déroulante des départements -->
                        <option v-for="department in departments" :key="department._id" :value="department._id">
                          {{ department.name }}
                        </option>
                      </select>
                    </div>

                    <div class="input-box">
                      <span class="details">Image 3</span>
                      <input type="file" @change="handleFileChange($event, 'img3')" />
                    </div>
                  </div>
                  <div class="boutton">
                    <input type="submit" value="Modifier" @click="
                      hideUpdateModal();
                    EditMember();
                    getAllMembers();
                    " />
                  </div>
                </form>
              </div>
            </modal>
            <!--  -->
            <modal name="ajouterEmployée" height="auto" :scrollable="true" :shiftX="0.4" :shiftY="0.5"
              @closed="resetForm">
              <div class="container">
                <div class="title">Ajouter un employéé</div>
                <form @submit.prevent="handleSubmit">
                  <div class="user-details">
                    <div class="input-box">
                      <span class="details">Nom</span>
                      <input type="text" placeholder="Entrer le nom" required v-model="employeeDetails.firstName" />
                    </div>
                    <div class="input-box">
                      <span class="details">Prénom</span>
                      <input type="text" placeholder="Entrer le prénom" required v-model="employeeDetails.lastName" />
                    </div>
                    <div class="input-box">
                      <span class="details">Numéro téléphone</span>
                      <input type="text" placeholder="Entrer le numéro de téléphone" required
                        v-model="employeeDetails.phone" />
                    </div>
                    <div class="input-box">
                      <span class="details">Adresse</span>
                      <input type="text" placeholder="Entrer l'adresse" required v-model="employeeDetails.position" />
                    </div>
                    <div class="input-box">
                      <span class="details">Identifiant Checkin</span>
                      <select v-model="employeeDetails.deviceUserId" required>
                        <option disabled value="">Sélectionnez un ID disponible</option>
                        <option v-for="u in availableUsers" :key="u.userId" :value="u.userId">
                          {{ u.userId }} - {{ u.name }}
                        </option>
                      </select>

                    </div>

                    <div class="input-box">
                      <span class="details">Département</span>
                      <select v-model="employeeDetails.departmentId" required>
                        <option value="" disabled selected>Choisir un département</option>
                        <!-- Liste déroulante des départements -->
                        <option v-for="department in departments" :key="department._id" :value="department._id">
                          {{ department.name }}
                        </option>
                      </select>
                    </div>
                    <div class="input-box">
                      <span class="details">Image 3</span>
                      <input type="file" name="employeeImage" @change="onFileChange" />
                    </div>
                  </div>
                  <div class="boutton">
                    <input type="submit" value="Ajouter" />
                  </div>
                </form>
              </div>
            </modal>


            <modal name="supprimerEmployée" height="auto" :scrollable="true" :shiftX="0.4" :shiftY="0.5">
              <div class="container">
                <div class="title">Suprresion de l'employée</div>
                <form action="#">
                  <div class="user-details">
                    <div class="input-box">
                      <h4>Voulez-vous supprimer {{ clickMember.firstName + clickMember.lastName }} ?</h4>
                    </div>
                  </div>

                  <div class="boutton">
                    <input type="submit" value="Supprimer" @click="
                      hideDeletModal();
                    deleteMember();
                    getAllMembers();
                    " />
                  </div>

                  <div></div>
                </form>
              </div>
            </modal>
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";

export default {
  components: {
  },
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
      employeeImageFile: null,
      searchQuery: "",
      errorMessage: "",
      successMessage: "",
      members: [],
      departments: [],
      availableUsers: [],
      totalValueData: [],
      clickMember: {},
    };
  },

  mounted() {
    this.searchTable();
    this.sortTable();
    this.getAllMembers();
    this.getDepartments();
    this.hideModal();
    this.fetchAvailableUsers();

  },

  methods: {
    onFileChange(e) {
      this.employeeImageFile = e.target.files[0];
      console.log("FICHIER SELECTIONNE:", this.employeeImageFile);
    }

    ,
    async saveEmployee(formData) {
      try {
        const response = await axios.post(
          "https://tsg-back.onrender.com/api/employees",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status === 200) {
          this.successMessage = response.data.message;
          this.getAllMembers();
          this.showSuccessAlert(response.data.message);
          this.fetchAvailableUsers();
          this.hideModal();
        } else {
          console.error(response.data);
        }
      } catch (error) {
        console.error(error);
      }
    },
    handleSubmit() {
      let formData = new FormData();

      // ajoute tous les champs texte
      for (let key in this.employeeDetails) {
        formData.append(key, this.employeeDetails[key]);
      }

      // ajoute l'image
      if (this.employeeImageFile) {
        formData.append("employeeImage", this.employeeImageFile);
      }


      console.log([...formData]);
      this.saveEmployee(formData);
    },
    handleFileChange(event, key) {
      this.employeeDetails[key] = event.target.files[0];
    },

    fetchAvailableUsers() {
      axios
        .get('https://tsg-back.onrender.com/api/checkin/checkin-available')
        .then((res) => {
          // IMPORTANT : la réponse est { availableUsers: [...] }
          this.availableUsers = res.data.availableUsers;
        })
        .catch((err) => console.error(err));
    },

    showModal() {
      this.$modal.show("ajouterEmployée");
    },
    hideModal() {
      this.$modal.hide("ajouterEmployée");
    },
    resetForm() {
      this.employeeDetails = {
        firstName: "",
        lastName: "",
        phone: "",
        position: "",
        departmentId: "",
        deviceUserId: "",
        employeeImage: ""
      };
    },

    showEditModal() {
      this.$modal.show("modifierEmployée");
    },
    hideUpdateModal() {
      this.$modal.hide("modifierEmployée");
    },
    showDeletModal() {
      this.$modal.show("supprimerEmployée");
    },
    hideDeletModal() {
      this.$modal.hide("supprimerEmployée");
    },

    showSuccessAlert() {
      Swal.fire({
        icon: "success",
        title: "Employée repertoriée dans la base",

        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 4000,
      });
    },

    showEditAlert() {
      Swal.fire({
        icon: "success",
        title: "Modification d'information de employée avec succès !",

        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 4000,
      });
    },

    showDeleteAlert() {
      Swal.fire({
        icon: "success",
        title: "employée supprimée avec succès !",

        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 4000,
      });
    },
    getDepartments() {
      axios
        .get('https://tsg-back.onrender.com/api/departments') // Remplace par l'URL de ton API
        .then(response => {
          // L'API retourne un tableau de départements
          this.departments = response.data;
        })
        .catch(error => {
          console.error('Erreur lors de la récupération des départements:', error);
        });
    },
    getAllMembers() {
      axios
        .get("https://tsg-back.onrender.com/api/employees")
        .then((response) => {
          if (response.data.error) {
            this.errorMessage = response.data.message;
            console.log("test");
          } else {
            this.members = response.data;
            console.log(response.data);
          }
        });
    },
    matchesSearch(member) {
      if (!this.searchQuery) return true;
      const q = this.searchQuery.toLowerCase();
      return (
        (member.firstName && member.firstName.toLowerCase().includes(q)) ||
        (member.lastName && member.lastName.toLowerCase().includes(q)) ||
        (member.departmentId?.name && member.departmentId.name.toLowerCase().includes(q)) ||
        (member.phone && member.phone.toLowerCase().includes(q)) ||
        (member.position && member.position.toLowerCase().includes(q))
      );
    },
    getClassForDepartment(departmentId) {
      console.log("Département ID reçu :", departmentId); // Affiche l'ID
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
        return this.$style.employeeProfileCard;  // Classe par défaut
      }
    },


    EditMember() {
      axios
        .put(
          `https://tsg-back.onrender.com/api/employees/${this.clickMember._id}`,
          {
            firstName: this.clickMember.firstName,
            lastName: this.clickMember.lastName,
            phone: this.clickMember.phone,
            position: this.clickMember.position,
            deviceUserId: this.clickMember.deviceUserId,
            departmentId: this.clickMember.departmentId,
            hireDate: this.clickMember.hireDate,

          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          this.clickMember = {};
          if (response.data.error) {
            this.errorMessage = response.data.message;
          } else {
            this.successMessage = response.data.message;
            this.getAllMembers();
            this.fetchAvailableUsers();

            this.showEditAlert(response.data.message);
          }
        })
        .catch((error) => {
          this.errorMessage =
            "Une erreur s'est produite lors de la mise à jour.";
          console.error(error);
        });
    },
    deleteMember() {
      axios
        .delete(
          `https://tsg-back.onrender.com/api/employees/${this.clickMember._id}`
        )
        .then((response) => {
          this.clickMember = {};
          if (response.data.error) {
            this.errorMessage = response.data.message;
          } else {
            this.successMessage = response.data.message;
            this.getAllMembers();
            this.showDeleteAlert(response.data.message);
          }
        })
        .catch((error) => {
          this.errorMessage =
            "Une erreur s'est produite lors de la suppression.";
          console.error(error);
        });
    },
    selectMember(member) {
      this.clickMember = member;
    },

    searchTable() {
      const search = document.querySelector('[data-role="search-input"]');
      search.addEventListener("input", this.searchTable);
      const table_rows = document.querySelectorAll('[data-role="table-row"]');
      table_rows.forEach((row, i) => {
        let table_data = row.textContent.toLowerCase(),
          search_data = search.value.toLowerCase();

        row.classList.toggle(
          "Voiture_hide_mO9qt",
          table_data.indexOf(search_data) < 0
        );
        row.style.setProperty("--delay", i / 25 + "s");
      });
    },
    sortTable() {
      const table_headings = document.querySelectorAll(".tableauTrHeader th");
      const table_rows = document.querySelectorAll(".tableauTbody tr");
      // const table_headings = document.querySelectorAll("thead th");
      // const table_rows = document.querySelectorAll("tbody tr");
      table_headings.forEach((head, i) => {
        let sort_asc = true;
        head.onclick = () => {
          table_headings.forEach((head) => head.classList.remove("active"));
          head.classList.add("active");

          document
            .querySelectorAll("td")
            .forEach((td) => td.classList.remove("active"));
          table_rows.forEach((row) => {
            row.querySelectorAll("td")[i].classList.add("active");
          });

          head.classList.toggle("asc", sort_asc);
          sort_asc = head.classList.contains("asc") ? false : true;

          sortTable(i, sort_asc);
        };
      });

      function sortTable(column, sort_asc) {
        [...table_rows]
          .sort((a, b) => {
            let first_row = a
              .querySelectorAll(".tableauTbody td")
            [column].textContent.toLowerCase(),
              second_row = b
                .querySelectorAll(".tableauTbody td")
              [column].textContent.toLowerCase();

            return sort_asc
              ? first_row < second_row
                ? 1
                : -1
              : first_row < second_row
                ? -1
                : 1;
          })
          .map((sorted_row) =>
            document.querySelector(".tableauTbody").appendChild(sorted_row)
          );
      }
    },
  },
};
</script>

<style module>
.custom-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  border-radius: 25px;
}

/* Entrée */
:global(.fade-enter-active) {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

:global(.fade-enter-from) {
  opacity: 0;
  transform: translateY(10px);
}

:global(.fade-enter-to) {
  opacity: 1;
  transform: translateY(0);
}

/* Sortie */
:global(.fade-leave-active) {

  /* 1️⃣ fade d’abord, 2️⃣ shrink après delay */
  transition: opacity 0.3s ease, transform 0.3s ease;
}

:global(.fade-leave-from) {
  opacity: 1;

}

:global(.fade-leave-to) {
  /* Phase 1 : fade + slide */
  opacity: 0 !important;
  transform: translateY(30px);
}

/* Stagger pour chaque enfant */
:global(.row > *:nth-child(1)) {
  transition-delay: 0.2s;
}

:global(.row > *:nth-child(2)) {
  transition-delay: 0.2s;
}

:global(.row > *:nth-child(3)) {
  transition-delay: 0.2s;
}

:global(.row > *:nth-child(4)) {
  transition-delay: 0.2s;
}

:global(.row > *:nth-child(5)) {
  transition-delay: 0.2s;
}

:global(.row > *:nth-child(6)) {
  transition-delay: 0.2s;
}

:global(.row > *:nth-child(7)) {
  transition-delay: 0.2s;
}

:global(.row > *:nth-child(8)) {
  transition-delay: 0.2s;
}

/* etc. */


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
  height: 68vh !important;

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
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 3.4rem 8.8rem #0005;
}

.table__header .input-group {
  width: 35%;
  height: 51px;
  background-color: #fff5;
  padding: 0 0.8rem;
  border-radius: 2rem;

  display: flex;
  justify-content: center;
  align-items: center;

  transition: 0.2s;
}

.table__header .input-group:hover {
  width: 45%;
  background-color: #fff8;
  box-shadow: 0 0.1rem 0.4rem #0002;
}

.table__header .input-group img {
  width: 1.2rem;
  height: 1.2rem;
}

.table__header .input-group input {
  width: 100%;
  padding: 0 0.5rem 0 0.3rem;
  background-color: transparent;
  border: none;
  outline: none;
}

.imgUser {
  /* width: 45px;
  height: 45px; */
  display: inline-block;
  width: 2rem;
  height: 2rem;
  background: #fff6 url(images/userAdd.png) center / 80% no-repeat;
  border-radius: 50%;
  transition: 0.2s ease-in-out;
  vertical-align: middle;
  border: none;
  margin-right: 20px;
}
</style>
