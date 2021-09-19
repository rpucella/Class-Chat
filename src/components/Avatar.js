import styled from 'styled-components'
import userSvg from '../assets/user-icon.svg'

const AvatarSvg = styled.svg`
  width: 100%;
  height: 100%;
`

const DefaultAvatar = ({avatar, size}) => {
  const {color, initials} = avatar
  const [r, g, b] = color
  const background = rgbToHex(r, g, b)
  const foreground = computeForeground(r, g, b)
  return (
    <AvatarSvg viewBox={'0 0 1 1'} size={size} >
      <circle cx={0.5} cy={0.5} r={0.5} fill={background} stroke={'#fff'} stroke-width={'1%'} />
      <text x={0.5} y={0.5} dy={'0.35em'} textAnchor={'middle'} fontSize={0.45} fill={foreground}>{initials}</text>
    </AvatarSvg>
  )
}

const Image = styled.img`
  height: 100%;
  width: 100%;
`

const NoAvatar = () => {
  return <Image src={userSvg} />
}

export const Avatar = ({avatar}) => {
    if (avatar && avatar.type === 'default') {
	return <DefaultAvatar avatar={avatar} />
    }
    return <NoAvatar />
}

function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

function computeForeground(r, g, b) { 
    if ((r * 0.299 + g * 0.587 + b * 0.114) > 186) {
	return '#000000'
    }
    else {
	return '#ffffff'
    }
}
