import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class App extends Component {
    constructor() {
        super();
        this.state = {
            query: '',
            games: [],
        };
    }
    componentDidMount() {
        this.refs.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.searchBGG(this.state.query)
        });
        this.refs.q.focus();
    }
    searchBGG(query) {
        console.log(query)
        fetch(`https://api.collectio.jp/bggapi/search?query=${encodeURIComponent(query)}&type=boardgame`, {
            mode: 'cors'
        }).then((r) => r.json()).then((r) => {
            console.log(r)
            if (r.status === 'ok') {
                if (r.data.items.total == 0) {
    
                } else if (r.data.items.total == 1) {
                    const game = r.data.items.item;
                    console.log(game.name.value)
                    this.search(game.id);
                    this.setState({games: [game]});
                } else {
                    r.data.items.item.map((game) => {
                        console.log(game)
                        this.search(game.id);
                    });
                    this.setState({games: r.data.items.item});
                }
            }
        });
    }
    search(id) {
        const url = `https://db.collectio.jp/wp-json/wp/v2/posts?filter[bgg]=etitle&filter[meta_value]=https://boardgamegeek.com/boardgame/`+id;
        fetch(url, {
            mode: 'cors'
        }).then((r) => r.json()).then((r) => {
            console.log(r)
            if (r.length > 0) {
                console.log(r[0].id);
                this.refs[id].href = `https://db.collectio.jp/wp-admin/post.php?post=${r[0].id}&action=edit`;
                this.refs[id].innerHTML = '[データベースにあり]';
            }
        });
    }
    render() {
        return <div>
            <form action="" ref="form">
                <input type="text" name="q" ref="q" value={this.state.query} onChange={() => this.setState({query: this.refs.q.value})} />
                <button>検索</button>
            </form>
            <p>※ゲーム名の別名でヒットするケースがあるので注意</p>
            <div className="games">
                {this.state.games.map((game) => (
                    <div className="game" key={game.id}>
                        {game.name.value} - {game.yearpublished ? game.yearpublished.value : ''}
                        <a ref={game.id} target="_blank">[検索中...]</a>
                    </div>
                ))}
            </div>
        </div>
    }
}




ReactDOM.render(
    <App />,
    document.getElementById('app')
);



