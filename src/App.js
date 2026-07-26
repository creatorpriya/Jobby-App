// src/App.js

import {Component} from 'react'
import {
  BrowserRouter,
  Switch,
  Route,
  Redirect,
  Link,
  withRouter,
} from 'react-router-dom'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {
  BsSearch,
  BsStarFill,
  BsBriefcaseFill,
  BsBoxArrowUpRight,
} from 'react-icons/bs'
import {MdLocationOn} from 'react-icons/md'

import './App.css'

const employmentTypesList = [
  {
    label: 'Full Time',
    employmentTypeId: 'FULLTIME',
  },
  {
    label: 'Part Time',
    employmentTypeId: 'PARTTIME',
  },
  {
    label: 'Freelance',
    employmentTypeId: 'FREELANCE',
  },
  {
    label: 'Internship',
    employmentTypeId: 'INTERNSHIP',
  },
]

const salaryRangesList = [
  {
    salaryRangeId: '1000000',
    label: '10 LPA and above',
  },
  {
    salaryRangeId: '2000000',
    label: '20 LPA and above',
  },
  {
    salaryRangeId: '3000000',
    label: '30 LPA and above',
  },
  {
    salaryRangeId: '4000000',
    label: '40 LPA and above',
  },
]

const ProtectedRoute = props => {
  const jwtToken = Cookies.get('jwt_token')

  if (jwtToken === undefined) {
    return <Redirect to="/login" />
  }

  return <Route {...props} />
}

const Header = withRouter(props => {
  const onLogout = () => {
    Cookies.remove('jwt_token')
    props.history.replace('/login')
  }

  return (
    <nav className="header">
      <Link to="/">
        <img
          src="https://assets.ccbp.in/frontend/react-js/logo-img.png"
          alt="website logo"
          className="logo"
        />
      </Link>

      <ul className="nav-links">
        <li>
          <Link className="link" to="/">
            Home
          </Link>
        </li>

        <li>
          <Link className="link" to="/jobs">
            Jobs
          </Link>
        </li>

        <li>
          <button type="button" className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  )
})

class Login extends Component {
  state = {
    username: '',
    password: '',
    errorMsg: '',
    showError: false,
  }

  onSubmitSuccess = jwtToken => {
    Cookies.set('jwt_token', jwtToken, {expires: 30})
    const {history} = this.props
    history.replace('/')
  }

  onSubmitFailure = errorMsg => {
    this.setState({
      errorMsg,
      showError: true,
    })
  }

  submitForm = async event => {
    event.preventDefault()

    const {username, password} = this.state

    const userDetails = {
      username,
      password,
    }

    const url = 'https://apis.ccbp.in/login'

    const options = {
      method: 'POST',
      body: JSON.stringify(userDetails),
    }

    const response = await fetch(url, options)

    const data = await response.json()

    if (response.ok === true) {
      this.onSubmitSuccess(data.jwt_token)
    } else {
      this.onSubmitFailure(data.error_msg)
    }
  }

  render() {
    const jwtToken = Cookies.get('jwt_token')

    if (jwtToken !== undefined) {
      return <Redirect to="/" />
    }

    const {username, password, errorMsg, showError} = this.state

    return (
      <div className="login-container">
        <form className="login-form" onSubmit={this.submitForm}>
          <img
            src="https://assets.ccbp.in/frontend/react-js/logo-img.png"
            alt="website logo"
            className="login-logo"
          />

          <label htmlFor="username">USERNAME</label>

          <input
            id="username"
            type="text"
            value={username}
            onChange={event => this.setState({username: event.target.value})}
          />

          <label htmlFor="password">PASSWORD</label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={event => this.setState({password: event.target.value})}
          />

          <button type="submit">Login</button>

          {showError && <p>{errorMsg}</p>}
        </form>
      </div>
    )
  }
}

const Home = () => (
  <>
    <Header />

    <div className="home-container">
      <h1>Find The Job That Fits Your Life</h1>

      <p>
        Millions of people are searching for jobs, salary information, company
        reviews. Find the job that fits your abilities and potential.
      </p>

      <Link to="/jobs">
        <button type="button">Find Jobs</button>
      </Link>
    </div>
  </>
)

class Jobs extends Component {
  state = {
    profileData: {},
    jobsData: [],
    searchInput: '',
    activeSalary: '',
    activeEmployment: [],
    profileStatus: 'INITIAL',
    jobsStatus: 'INITIAL',
  }

  componentDidMount() {
    this.getProfile()
    this.getJobs()
  }

  getProfile = async () => {
    this.setState({profileStatus: 'LOADING'})

    const jwtToken = Cookies.get('jwt_token')

    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }

    const response = await fetch('https://apis.ccbp.in/profile', options)

    const data = await response.json()

    if (response.ok === true) {
      this.setState({
        profileData: data.profile_details,
        profileStatus: 'SUCCESS',
      })
    } else {
      this.setState({profileStatus: 'FAILURE'})
    }
  }

  getJobs = async () => {
    this.setState({jobsStatus: 'LOADING'})

    const {searchInput, activeSalary, activeEmployment} = this.state

    const employmentTypes = activeEmployment.join(',')

    const url = `https://apis.ccbp.in/jobs?employment_type=${employmentTypes}&minimum_package=${activeSalary}&search=${searchInput}`

    const jwtToken = Cookies.get('jwt_token')

    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }

    const response = await fetch(url, options)

    const data = await response.json()

    if (response.ok === true) {
      this.setState({
        jobsData: data.jobs,
        jobsStatus: 'SUCCESS',
      })
    } else {
      this.setState({
        jobsStatus: 'FAILURE',
      })
    }
  }

  onChangeSearch = event => {
    this.setState({
      searchInput: event.target.value,
    })
  }

  onSearch = () => {
    this.getJobs()
  }

  changeEmployment = id => {
    this.setState(
      prevState => {
        const isExists = prevState.activeEmployment.includes(id)

        return {
          activeEmployment: isExists
            ? prevState.activeEmployment.filter(each => each !== id)
            : [...prevState.activeEmployment, id],
        }
      },
      () => this.getJobs(),
    )
  }

  changeSalary = id => {
    this.setState(
      {
        activeSalary: id,
      },
      () => this.getJobs(),
    )
  }

  renderProfile = () => {
    const {profileStatus, profileData} = this.state

    if (profileStatus === 'LOADING') {
      return (
        <div className="loader-container" data-testid="loader">
          <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
        </div>
      )
    }

    if (profileStatus === 'FAILURE') {
      return (
        <div>
          <button type="button" onClick={this.getProfile}>
            Retry
          </button>
        </div>
      )
    }

    return (
      <div>
        <img src={profileData.profile_image_url} alt="profile" />

        <h1>{profileData.name}</h1>

        <p>{profileData.short_bio}</p>
      </div>
    )
  }

  renderJobs = () => {
    const {jobsStatus, jobsData} = this.state

    if (jobsStatus === 'LOADING') {
      return (
        <div className="loader-container" data-testid="loader">
          <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
        </div>
      )
    }

    if (jobsStatus === 'FAILURE') {
      return (
        <div>
          <img
            src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
            alt="failure view"
          />

          <h1>Oops! Something Went Wrong</h1>

          <p>We cannot seem to find the page you are looking for</p>

          <button type="button" onClick={this.getJobs}>
            Retry
          </button>
        </div>
      )
    }

    if (jobsData.length === 0) {
      return (
        <div>
          <img
            src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
            alt="no jobs"
          />

          <h1>No Jobs Found</h1>

          <p>We could not find any jobs. Try other filters</p>
        </div>
      )
    }

    return (
      <ul>
        {jobsData.map(eachJob => (
          <Link to={`/jobs/${eachJob.id}`} key={eachJob.id} className="link">
            <li>
              <img src={eachJob.company_logo_url} alt="company logo" />

              <h1>{eachJob.title}</h1>

              <p>{eachJob.rating}</p>

              <p>{eachJob.location}</p>

              <p>{eachJob.employment_type}</p>

              <p>{eachJob.package_per_annum}</p>

              <h1>Description</h1>

              <p>{eachJob.job_description}</p>
            </li>
          </Link>
        ))}
      </ul>
    )
  }

  render() {
    const {searchInput, activeSalary} = this.state

    return (
      <>
        <Header />

        <div className="jobs-container">
          <div>
            {this.renderProfile()}

            <h1>Type of Employment</h1>

            <ul>
              {employmentTypesList.map(each => (
                <li key={each.employmentTypeId}>
                  <input
                    type="checkbox"
                    id={each.employmentTypeId}
                    onChange={() =>
                      this.changeEmployment(each.employmentTypeId)
                    }
                  />

                  <label htmlFor={each.employmentTypeId}>{each.label}</label>
                </li>
              ))}
            </ul>

            <h1>Salary Range</h1>

            <ul>
              {salaryRangesList.map(each => (
                <li key={each.salaryRangeId}>
                  <input
                    type="radio"
                    id={each.salaryRangeId}
                    name="salary"
                    checked={activeSalary === each.salaryRangeId}
                    onChange={() => this.changeSalary(each.salaryRangeId)}
                  />

                  <label htmlFor={each.salaryRangeId}>{each.label}</label>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div>
              <input
                type="search"
                value={searchInput}
                onChange={this.onChangeSearch}
              />

              <button
                type="button"
                data-testid="searchButton"
                onClick={this.onSearch}
              >
                <BsSearch />
              </button>
            </div>

            {this.renderJobs()}
          </div>
        </div>
      </>
    )
  }
}

class JobDetails extends Component {
  state = {
    status: 'INITIAL',
    jobData: {},
    similarJobs: [],
  }

  componentDidMount() {
    this.getJobDetails()
  }

  getJobDetails = async () => {
    this.setState({
      status: 'LOADING',
    })

    const jwtToken = Cookies.get('jwt_token')

    const {match} = this.props
    const {id} = match.params

    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }

    const response = await fetch(`https://apis.ccbp.in/jobs/${id}`, options)

    const data = await response.json()

    if (response.ok === true) {
      this.setState({
        jobData: data.job_details,
        similarJobs: data.similar_jobs,
        status: 'SUCCESS',
      })
    } else {
      this.setState({
        status: 'FAILURE',
      })
    }
  }

  render() {
    const {status, jobData, similarJobs} = this.state

    if (status === 'LOADING') {
      return (
        <div className="loader-container" data-testid="loader">
          <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
        </div>
      )
    }

    if (status === 'FAILURE') {
      return (
        <div>
          <img
            src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
            alt="failure view"
          />

          <h1>Oops! Something Went Wrong</h1>

          <p>We cannot seem to find the page you are looking for</p>

          <button type="button" onClick={this.getJobDetails}>
            Retry
          </button>
        </div>
      )
    }

    return (
      <>
        <Header />

        <div>
          <img src={jobData.company_logo_url} alt="job details company logo" />

          <h1>{jobData.title}</h1>

          <p>{jobData.rating}</p>

          <p>{jobData.location}</p>

          <p>{jobData.employment_type}</p>

          <p>{jobData.package_per_annum}</p>

          <h1>Description</h1>

          <a
            href={jobData.company_website_url}
            target="_blank"
            rel="noreferrer"
          >
            Visit
            <BsBoxArrowUpRight />
          </a>

          <p>{jobData.job_description}</p>

          <h1>Skills</h1>

          <ul>
            {jobData.skills?.map(eachSkill => (
              <li key={eachSkill.name}>
                <img src={eachSkill.image_url} alt={eachSkill.name} />

                <p>{eachSkill.name}</p>
              </li>
            ))}
          </ul>

          <h1>Life at Company</h1>

          <img src={jobData.life_at_company?.image_url} alt="life at company" />

          <p>{jobData.life_at_company?.description}</p>

          <h1>Similar Jobs</h1>

          <ul>
            {similarJobs.map(eachJob => (
              <li key={eachJob.id}>
                <img
                  src={eachJob.company_logo_url}
                  alt="similar job company logo"
                />

                <h1>{eachJob.title}</h1>

                <p>{eachJob.rating}</p>

                <p>{eachJob.location}</p>

                <p>{eachJob.employment_type}</p>

                <h1>Description</h1>

                <p>{eachJob.job_description}</p>
              </li>
            ))}
          </ul>
        </div>
      </>
    )
  }
}

const NotFound = () => (
  <>
    <Header />

    <div>
      <img
        src="https://assets.ccbp.in/frontend/react-js/jobby-app-not-found-img.png"
        alt="not found"
      />

      <h1>Page Not Found</h1>

      <p>we are sorry, the page you requested could not be found.</p>
    </div>
  </>
)

const App = () => (
  <Switch>
    <Route exact path="/login" component={Login} />

    <ProtectedRoute exact path="/" component={Home} />

    <ProtectedRoute exact path="/jobs" component={Jobs} />

    <ProtectedRoute exact path="/jobs/:id" component={JobDetails} />

    <Route exact path="/not-found" component={NotFound} />

    <Redirect to="/not-found" />
  </Switch>
)

export default App
