import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class App extends Component {
    constructor() {
        super();
        this.state = {
            query: '',
            message: null,
            games: null,
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
        if (query==='') return this.setState({games: null, message: ''});
        this.setState({games: null, message: '検索中…'});
        fetch(`https://api.collectio.jp/bggapi/search?query=${encodeURIComponent(query)}&type=boardgame`, {
            mode: 'cors'
        }).then((r) => r.json()).then((r) => {
            // console.log(r)
            if (r.status === 'ok') {
                if (r.data.items.total == 0) {
                    this.setState({message: '見つかりませんでした'});
                } else if (r.data.items.total == 1) {
                    // const game = r.data.items.item;
                    console.log(game.name.value)
                    this.search(game.id);
                    this.setState({games: [game], message: '1件見つかりました'});
                } else {
                    const games = r.data.items.item;
                    games.slice(0, 2).map((game) => {
                        // console.log(game)
                        this.search(game.id);
                    });
                    setTimeout(() => {
                        games.slice(3, 10).map((game) => {
                            // console.log(game)
                            this.search(game.id);
                        });
                    }, 3000);
                    this.setState({games: games, message: games.length + '件見つかりました'});
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
                const game = r[0];
                console.log(game.id);
                this.refs[id].href = `https://db.collectio.jp/wp-admin/post.php?post=${game.id}&action=edit`;
                this.refs[id].innerHTML = '[' + game.title.rendered + ']';
            } else {
                this.refs[id].href = `https://db.collectio.jp/wp-admin/post-new.php?post_title=test&etitle=test&bgg=test`;
                this.refs[id].innerHTML = '[なし→新規追加]';
            }
        });
    }
    render() {
        return <div>
            <form action="" ref="form">
                <input type="text" name="q" ref="q" autoComplete="off" value={this.state.query} onChange={() => this.setState({query: this.refs.q.value})} />
                <button>検索</button>
            </form>
            <p>※ゲーム名の別名でヒットするケースがあるので注意</p>
            <div className="games">
                {this.state.message ? (
                    <p>{this.state.message}</p>
                ) : null}
                {this.state.games && this.state.games.map((game) => (
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



