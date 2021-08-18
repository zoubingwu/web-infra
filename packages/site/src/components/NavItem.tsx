import React, { useCallback } from 'react'
import clsx from 'clsx'

import { actions, useAppDispatch, useAppSelector } from '../model'

interface NavItemData {
  title: string
  route: string
  level: number
  items?: NavItemData[]
}

const NavItem: React.FC<NavItemData & { className?: string }> = ({
  title,
  route,
  items,
  level,
  className,
}) => {
  const dispatch = useAppDispatch()
  const currentRoute = useAppSelector(state => state.routes.route)
  const changeRoute = useCallback(() => {
    dispatch(actions.setRoute(route))
  }, [title])

  const isExpand = route === currentRoute
  console.log(isExpand, items, route, currentRoute)
  return (
    <li>
      <div>
        <a
          href={'#' + route}
          onClick={changeRoute}
          className={clsx(
            'flex py-5px hover:font-bold',
            level === 0 && 'font-bold',
            className
          )}>
          {title}
        </a>

        {isExpand && items && (
          <ul>
            {items.map(i => (
              <NavItem
                title={i.title}
                route={i.route}
                level={i.level}
                key={i.route}
                className="ml-20px"
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}

export default NavItem
