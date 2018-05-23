var app = new Vue({
    el: '#app',
    mounted() {
          this.getdata();
      },
    data () {
      return {
        info: []
      }
    },
    methods: {
      getdata () {
      axios.get('http://163.13.127.53:7153/div_yield')
      .then(response => {
        console.log(response);
        this.info = response.data;
      })
    }
  }
  })