const qiita_posts = new Vue({
  el: '#qiita-posts',
  data: {
    results: []
  },
  mounted() {
    axios.get("https://qiita.com/api/v2/items?page=1&per_page=20&query=user%3Aaltescy")
    .then(response => {
      this.results = response.data.map(e => {
        return {
          "url": e.url,
          "title": e.title,
          "created_at": e.created_at,
          "date": (new Date(e.created_at)).toLocaleDateString(),
          "abst": e.rendered_body.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'').slice(0, 200) + "...",
        };
      });
      this.results.sort(function(a, b) {
        if(a.created_at < b.created_at) return 1;
        if(a.created_at > b.created_at) return -1;
        return 0;
      });
    })
  }
});
