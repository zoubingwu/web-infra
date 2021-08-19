import React from 'react'
import clsx from 'clsx'
import { IoMdMoon, IoMdSunny } from 'react-icons/io'

import { actions, useAppDispatch, useAppSelector } from '../model'
import { ReactComponent as Logo } from '../assets/pingcap_logo.svg'
import { ReactComponent as NamedLogo } from '../assets/pingcap_name_logo.svg'

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
        <div className="site-nav-title">
          <NamedLogo />
        </div>
        <div className="site-nav-divider" />
        <div
          className="site-nav-button"
          onClick={() => dispatch(actions.toggleDarkMode())}>
          {darkMode ? <IoMdSunny /> : <IoMdMoon />}
          <span className="ml-4">
            {darkMode ? 'Light Theme' : 'Dark Theme'}
          </span>
        </div>
        <div className="site-nav-divider" />
        <NavMenu />
        <small className="flex items-center px-15px">
          <span className="flex items-center mr-2">
            © {new Date().getFullYear()}
            <Logo className="mx-5px" height={14} width={14} />
            <a
              href="https://pingcap.com/"
              className="hover:underline"
              target="_blank">
              PingCAP
            </a>
          </span>
          <a
            href="https://github.com/ti-fe/web-infra"
            target="_blank"
            className="hover:underline">
            View on GitHub
          </a>
        </small>
      </div>
    </div>
  )
}

export default Nav
