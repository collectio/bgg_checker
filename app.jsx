import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class App extends Component {
    constructor() {
        super();
        this.state = {
            query: '',
            message: null,
            games: null,
            showCreateButton: false, 
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
        if (query==='') return this.setState({games: null, message: '', showCreateButton: false});
        this.setState({games: null, message: '検索中…', showCreateButton: false});
        fetch(`https://api.collectio.jp/bggapi/search?query=${encodeURIComponent(query)}`, {
            mode: 'cors'
        }).then((r) => r.json()).then((r) => {
            // console.log(r)
            if (r.status === 'ok') {
                if (r.data.items.total == 0) {
                    this.setState({message: '見つかりませんでした', showCreateButton: this.refs.q.value});
                } else if (r.data.items.total == 1) {
                    const game = r.data.items.item;
                    // console.log(game.name.value)
                    this.search(game);
                    this.setState({games: [game], message: '1件見つかりました'});
                } else {
                    const games = r.data.items.item;
                    games.slice(0, 2).map((game) => {
                        // console.log(game)
                        this.search(game);
                    });
                    setTimeout(() => {
                        games.slice(2, 10).map((game) => {
                            // console.log(game)
                            this.search(game);
                        });
                    }, 3000);
                    this.setState({games: games, message: games.length + '件見つかりました'});
                }
            }
        });
    }
    search(game) {
        const url = `https://db.collectio.jp/wp-json/wp/v2/posts?filter[bgg]=etitle&filter[meta_value]=https://boardgamegeek.com/boardgame/`+game.id;
        fetch(url, {
            mode: 'cors'
        }).then((r) => r.json()).then((r) => {
            console.log(r)
            if (r.length > 0) {
                const dbgame = r[0];
                console.log(dbgame);
                this.refs[game.id].href = `https://db.collectio.jp/wp-admin/post.php?post=${dbgame.id}&action=edit`;
                this.refs[game.id].innerHTML = '[' + dbgame.title.rendered + ']';
            } else {
                fetch(`https://api.collectio.jp/bggapi/thing?id=${game.id}`, {
                    mode: 'cors'
                }).then((r) => r.json()).then((r) => {
                    console.log(r)
                    if (r.status === 'ok') {
                        const bgggame = r.data.items.item;
                        console.log(bgggame)
                        const title = encodeURIComponent(bgggame.name.value);
                        this.refs[game.id].href = `https://db.collectio.jp/wp-admin/post-new.php?post_title=${title}&etitle=${title}&year=${bgggame.yearpublished.value}&bgg=${'https://boardgamegeek.com/boardgame/'+game.id}&playingTime=${bgggame.minplaytime.value}&minPlayers=${bgggame.minplayers.value}&maxPlayers=${bgggame.maxplayers.value}&playAge=${bgggame.minage.value}`;
                        this.refs[game.id].innerHTML = '[なし→新規追加]';
                    }
                });
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
                        &nbsp;<a ref={game.id} target="_blank">[検索中...]</a>
                    </div>
                ))}
                {this.state.showCreateButton ? (
                    <ul>
                        <li>
                            <a href={`https://db.collectio.jp/wp-admin/edit.php?post_type=post&s=${encodeURIComponent(this.state.showCreateButton)}}`} target="_blank">
                                「{this.state.showCreateButton}」をデータベースで検索
                            </a>
                        </li>
                        <li>
                            <a href={`https://www.google.co.jp/search?q=${encodeURIComponent(this.state.showCreateButton)}`} target="_blank">
                                「{this.state.showCreateButton}」をGoogleで検索
                            </a>
                        </li>
                        <li>
                            <a href={`https://db.collectio.jp/wp-admin/post-new.php?post_title=${encodeURIComponent(this.state.showCreateButton)}&etitle=${encodeURIComponent(this.state.showCreateButton)}`} target="_blank">
                                「{this.state.showCreateButton}」で新規作成
                            </a>
                        </li>
                    </ul>
                ) : null}
            </div>
        </div>
    }
}




ReactDOM.render(
    <App />,
    document.getElementById('app')
);



