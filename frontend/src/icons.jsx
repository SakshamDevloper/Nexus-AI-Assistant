import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faWandSparkles,
  faMicrophone,
  faComment,
  faBrain,
  faGlobe,
  faBolt,
  faUser,
  faMicrophoneSlash,
  faPaperPlane,
  faBars,
  faRightFromBracket,
  faClock,
  faTrashCan,
  faMessage,
  faChevronRight,
  faChevronDown,
  faXmark,
  faEnvelope,
  faSpinner,
  faCopy,
  faCheck,
  faThumbsUp,
  faThumbsDown,
  faRobot,
  faMagnifyingGlass,
  faCloudSun,
  faBookOpen,
  faSun,
  faMoon,
} from '@fortawesome/free-solid-svg-icons'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'

function icon(iconDef) {
  return function IconComponent({ size = 16, className = '' }) {
    return <FontAwesomeIcon icon={iconDef} width={size} height={size} className={className} style={{ fontSize: size }} />
  }
}

export const ArrowRight = icon(faArrowRight)
export const Sparkles = icon(faWandSparkles)
export const Microphone = icon(faMicrophone)
export const Comment = icon(faComment)
export const Brain = icon(faBrain)
export const Globe = icon(faGlobe)
export const Bolt = icon(faBolt)
export const User = icon(faUser)
export const MicrophoneSlash = icon(faMicrophoneSlash)
export const PaperPlane = icon(faPaperPlane)
export const Bars = icon(faBars)
export const RightFromBracket = icon(faRightFromBracket)
export const Clock = icon(faClock)
export const TrashCan = icon(faTrashCan)
export const Message = icon(faMessage)
export const ChevronRight = icon(faChevronRight)
export const ChevronDown = icon(faChevronDown)
export const Xmark = icon(faXmark)
export const Envelope = icon(faEnvelope)
export const Google = icon(faGoogle)
export const Spinner = icon(faSpinner)
export const Copy = icon(faCopy)
export const Check = icon(faCheck)
export const ThumbsUp = icon(faThumbsUp)
export const ThumbsDown = icon(faThumbsDown)
export const Robot = icon(faRobot)
export const MagnifyingGlass = icon(faMagnifyingGlass)
export const CloudSun = icon(faCloudSun)
export const BookOpen = icon(faBookOpen)
export const Sun = icon(faSun)
export const Moon = icon(faMoon)
