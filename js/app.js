const vm = new Vue({
  el: '.qiita-posts',
  data: {
    results: []
  },
  mounted() {
    axios.get("https://qiita.com/api/v2/items?page=1&per_page=20&query=user%3Aaltescy")
    .then(response => {
        this.results = response.data.map(e => {
            e.date = (new Date(e.created_at)).toLocaleDateString();
            e.abst = e.rendered_body.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'').slice(0, 200) + "...";
            return e;
        });
        this.results.sort(function(a, b) {
          if(a.created_at < b.created_at) return 1;
          if(a.created_at > b.created_at) return -1;
          return 0;
        });
    })
  }
});