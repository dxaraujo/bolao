import { Switch, Route, Redirect } from 'react-router-dom'

import PartidaList from './partidaList'
import PartidaForm from './partidaForm'

const partida = () => {
    return (
        <Switch>
            <Route path='/partida/create' component={PartidaForm}/>
            <Route path='/partida/update' component={PartidaForm}/>
            <Route path='/partida/list' component={PartidaList}/>
            <Redirect from="/partida" to="/partida/list" />
        </Switch>
    )
}

export default partida