import { Switch, Route, Redirect } from 'react-router-dom'

import TimeList from './timeList'
import TimeForm from './timeForm'

const time = () => {
    return (
        <Switch>
            <Route path='/time/create' component={TimeForm}/>
            <Route path='/time/update' component={TimeForm}/>
            <Route path='/time/list' component={TimeList}/>
            <Redirect from="/time" to="/time/list" />
        </Switch>
    )
}

export default time