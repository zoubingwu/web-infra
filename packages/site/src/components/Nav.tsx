import React from 'react'

import { actions, useAppDispatch } from '../model'

import NavMenu from './NavMenu'

const Nav = () => {
  const dispatch = useAppDispatch()

  return (
    <div className="w-270px" data-theme="dark">
      <button onClick={() => dispatch(actions.toggleDarkMode())}>
        toggle theme
      </button>
      <NavMenu />
    </div>
  )
}

export default Nav
