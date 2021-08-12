import React, { useCallback } from 'react'

import { actions, useAppDispatch } from '../model'

const NavItem: React.FC<{
  title: string
  route: string
}> = ({ title, route }) => {
  const dispatch = useAppDispatch()
  const changeRoute = useCallback(() => {
    dispatch(actions.setRoute(title.toLowerCase()))
  }, [title])

  return (
    <li>
      <div>
        <a href={'#' + route} onClick={changeRoute}>
          {title}
        </a>
      </div>
    </li>
  )
}

export default NavItem
