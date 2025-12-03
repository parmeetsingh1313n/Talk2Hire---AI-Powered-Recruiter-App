import CreateOptions from './_components/CreateOptions'
import LatestInterviewLists from './_components/LatestInterviewLists'

function Dashboard() {
  return (
    <div>
      {/* <WelcomeContainer /> */}
      <h2 className='my-3 font-bold bg-gradient-to-r from-blue-600 via-sky-600 to-blue-800 bg-clip-text text-transparent text-3xl'>Dashboard</h2>
      <CreateOptions />
      <LatestInterviewLists />
    </div>
  )
}

export default Dashboard
