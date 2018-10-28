import React, { Component } from 'react'
import Clarifai from 'clarifai'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import Navigation from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo'
import Signin from './components/Signin/Signin'
import Register from './components/Register/Register'
import Rank from './components/Rank/Rank'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Results from './components/Results/Results'
import './App.css'

const app = new Clarifai.App({
  apiKey: '3ec8ae8c060f41ea9c1b3f3fd997ff69'
})

const initialState = {
  input: '',
  imgUrl: '',
  box: {},
  results: {},
  route: 'signin',
  isSignedin: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super()
    this.state = initialState
  }

  calculateFaceLocation = data => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box
    const image = document.getElementById('inputimage')
    const width = Number(image.width)
    const height = Number(image.height)
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height
    }
  }

  displayFaceBox = box => {
    this.setState({ box: box })
  }

  displayResults = data => {
    const age =
      data.outputs[0].data.regions[0].data.face.age_appearance.concepts[0].name
    const gender =
      data.outputs[0].data.regions[0].data.face.gender_appearance.concepts[0]
        .name
    const race =
      data.outputs[0].data.regions[0].data.face.multicultural_appearance
        .concepts[0].name
    console.log('age', age, 'gender', gender, 'race', race)
    this.setState({
      results: {
        age: age,
        gender: gender,
        race: race
      }
    })
  }

  onInputChange = event => {
    this.setState({ input: event.target.value })
  }

  onPictureSubmit = () => {
    this.setState({ imgUrl: this.state.input })

    app.models
      .predict(Clarifai.DEMOGRAPHICS_MODEL, this.state.input)
      .then(response => {
        if (response) {
          console.log(response)
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(res => res.json())
            .then(entries => {
              if (entries) {
                this.setState({
                  user: {
                    ...this.state.user,
                    entries: entries
                  }
                })
              }
            })
            .catch(console.log)
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
        this.displayResults(response)
      })
      .catch(err => console.log(err))
  }

  onRouteChange = route => {
    if (route === 'home') {
      this.setState({ isSignedin: true })
    } else if (route === 'signin') {
      this.setState(initialState)
    }
    this.setState({ route: route })
  }

  loadUser = user => {
    this.setState({
      user: user
    })
  }

  render() {
    const { isSignedin, box, imgUrl, route, results } = this.state
    return (
      <div className="App">
        <Navigation
          onRouteChange={this.onRouteChange}
          isSignedin={isSignedin}
        />
        {route === 'home' ? (
          <div>
            <Rank
              name={this.state.user.name}
              entries={this.state.user.entries}
            />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onPictureSubmit={this.onPictureSubmit}
            />
            <Results results={results} />
            <FaceRecognition box={box} imgUrl={imgUrl} />
          </div>
        ) : route === 'signin' ? (
          <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        ) : (
          <Register
            onRouteChange={this.onRouteChange}
            loadUser={this.loadUser}
          />
        )}
      </div>
    )
  }
}

export default App
