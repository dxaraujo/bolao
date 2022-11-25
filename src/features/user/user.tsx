import { Switch, Route, Redirect } from 'react-router-dom'

import UserList from './userList'
import UserForm from './userForm'

const user = () => {
    return (
        <Switch>
            <Route path='/user/update' component={UserForm}/>
            <Route path='/user/list' component={UserList}/>
            <Redirect from="/user" to="/user/list" />
        </Switch>
    )
}

export default user