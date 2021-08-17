import React from 'react'
import clsx from 'clsx'

import { actions, useAppDispatch, useAppSelector } from '../model'

import NavMenu from './NavMenu'

const Nav = () => {
  const dispatch = useAppDispatch()
  const darkMode = useAppSelector(state => state.globals.darkMode)

  return (
    <div className="relative w-270px">
      <div
        className={clsx(
          'site-nav transition',
          darkMode ? 'bg-dark-gray5 text-white' : 'bg-white text-dark-gray1'
        )}>
        <button onClick={() => dispatch(actions.toggleDarkMode())}>
          toggle theme
        </button>
        <NavMenu />
      </div>
    </div>
  )
}

export default Nav
