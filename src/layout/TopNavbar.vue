<template>
  <nav class="navbar navbar-expand-lg">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Administrateur</a>
      <div class="collapse navbar-collapse justify-content-end">
        <ul class="nav navbar-nav mr-auto"></ul>
        <ul class="navbar-nav ml-auto">
          <li class="nav-item">
            <a href="#"  class="nav-link" @click="logout">Se déconnecter</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
<script>
  import authService from '../services/auth';
export default {

  computed: {
    routeName() {
      const { name } = this.$route;
      return this.capitalizeFirstLetter(name);
    },
  },
  data() {
    return {
      activeNotifications: false,
         currentUser: null
    };
  },
  methods: {
     logout() {
      authService.logout();
      this.$router.push('/login');
    },
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    toggleNotificationDropDown() {
      this.activeNotifications = !this.activeNotifications;
    },
    closeDropDown() {
      this.activeNotifications = false;
    },
    toggleSidebar() {
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
    },
    hideSidebar() {
      this.$sidebar.displaySidebar(false);
    },
  },
};
</script>
<style>
</style>
