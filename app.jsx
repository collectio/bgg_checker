import React, { Component } from 'react';
import ReactDOM from 'react-dom';


function getQueryString() {
    var params = {}
    location.search.substr(1).split('&').map(function(param) {
        var pairs = param.split('=');
        params[pairs[0]] = decodeURIComponent(pairs[1]);
    });
    return params;    
}

class App extends Component {
    constructor() {
        super();
        const params = getQueryString();
        this.state = {
            query: params.q ? params.q : '',
            message: null,
            games: null,
            showCreateButton: false, 
        };
    }
    componentDidMount() {
        const params = getQueryString();
        if (params.q) {
            this.searchBGG(params.q)
        }
        this.refs.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.searchBGG(this.state.query)
        });
        this.refs.q.focus();
    }
    searchBGG(query) {
        // console.log(query)
        if (query==='') return this.setState({games: null, message: '', showCreateButton: false});
        this.setState({games: null, message: '検索中…', showCreateButton: false});
        fetch(`https://api.collectio.jp/bggapi/search?query=${encodeURIComponent(query)}`, {
            mode: 'cors'
        }).then((r) => r.json()).then((r) => {
            // console.log(r)
            if (r.status === 'ok') {
                if (r.data.items.total == 0) {
                    this.setState({message: '見つかりませんでした', showCreateButton: this.refs.q.value});
                } else {
                    let games;
                    if (r.data.items.total == 1) {
                        games = [r.data.items.item];
                    } else {
                        games = r.data.items.item.slice(0, 20);
                    }
                    this.setState({games: games, message: r.data.items.total + '件見つかりました'}, () => {
                        this.search(games[0]);
                    });
                 }
            }
        });
    }
    changeGames(id, callback) {
        this.state.games.map((game) => {
            if (game.id===id) {
                callback(game);
            }
        })
        this.setState({games: this.state.games});
    }
    search(game) {
        // console.log(game)
        this.changeGames(game.id, (game) => {
            game.linkTitle = '[検索中...]';
        });
        const url = `https://db.collectio.jp/wp-json/wp/v2/posts?filter[bgg]=etitle&filter[meta_value]=https://boardgamegeek.com/boardgame/`+game.id;
        fetch(url, {
            mode: 'cors'
        }).then((r) => r.json()).then((r) => {
            // console.log(r)
            if (r.length > 0) {
                const dbgame = r[0];
                // console.log(dbgame);
                this.changeGames(game.id, (game) => {
                    game.linkTitle = '[' + dbgame.title.rendered + ']';
                    game.href = `https://db.collectio.jp/wp-admin/post.php?post=${dbgame.id}&action=edit`;
                });
            } else {
                fetch(`https://api.collectio.jp/bggapi/thing?id=${game.id}`, {
                    mode: 'cors'
                }).then((r) => r.json()).then((r) => {
                    console.log(r)
                    if (r.status === 'ok') {
                        const bgggame = r.data.items.item;
                        console.log(bgggame)
                        let title = bgggame.name.length===1 ? bgggame.name.value : bgggame.name[0].value;
                        title = encodeURIComponent(title);
                        this.changeGames(game.id, (game) => {
                            game.linkTitle = '[なし→新規追加]';
                            game.href = `https://db.collectio.jp/wp-admin/post-new.php?post_title=${title}&etitle=${title}&year=${bgggame.yearpublished.value}&bgg=${'https://boardgamegeek.com/boardgame/'+game.id}&playingTime=${bgggame.minplaytime.value}&minPlayers=${bgggame.minplayers.value}&maxPlayers=${bgggame.maxplayers.value}&playAge=${bgggame.minage.value}`;
                        });
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
                        &nbsp;<a ref={game.id} href={game.href} target="_blank">{game.linkTitle ? (
                            game.linkTitle
                        ) : (
                            <button onClick={this.search.bind(this, game)}>検索</button>
                        )}</a>
                    </div>
                ))}
                {this.state.showCreateButton ? (
                    <ul>
                        <li>
                            <a href={`https://db.collectio.jp/wp-admin/edit.php?post_type=post&s=${encodeURIComponent(this.state.showCreateButton)}`} target="_blank">
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



