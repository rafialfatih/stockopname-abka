import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTeamStore = defineStore('teams', () => {
  const teams = ref([])
  const currentTeam = ref(null)

  const loadTeams = (data) => {
    teams.value = data
  }

  const setCurrentTeam = (team) => {
    currentTeam.value = team
  }

  return {
    teams,
    currentTeam,
    loadTeams,
    setCurrentTeam
  }
})
