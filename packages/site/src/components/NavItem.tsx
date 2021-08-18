import React, { useCallback, useMemo } from 'react'
import clsx from 'clsx'

import { actions, useAppDispatch, useAppSelector } from '../model'

interface NavItemData {
  title: string
  route: string
  level: number
  items?: NavItemData[]
}

const NavItem: React.FC<
  NavItemData & { className?: string; style?: React.CSSProperties }
> = ({ title, route, items, className, style }) => {
  const dispatch = useAppDispatch()
  const currentRoute = useAppSelector(state => state.routes.route)
  const changeRoute = useCallback(() => {
    dispatch(actions.setRoute(route))
  }, [route])

  const isExpand = useMemo(() => currentRoute.startsWith(route), [route])

  return (
    <li>
      <div>
        <a
          href={'#' + route}
          onClick={changeRoute}
          style={style}
          className={clsx(
            'flex flex-col py-5px hover:font-bold',
            currentRoute.includes(route) && 'font-bold',
            className
          )}>
          {title}
        </a>

        {isExpand && items && (
          <ul>
            {items.map(i => (
              <NavItem
                title={i.title}
                route={[route, i.route].join('.')}
                level={i.level}
                key={i.route}
                style={{ marginLeft: 20 * (i.level - 1) + 'px' }}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}

export default NavItem
