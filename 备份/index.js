import PlaneGame from './components/planeGame/PlaneGame.vue'
export { PlaneGame }

const components = [PlaneGame]
const install = function (App, options) {
  components.forEach((component) => {
    App.component(component.name, component)
  })
}

export default { install }