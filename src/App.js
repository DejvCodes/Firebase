import {projectFirestore} from "./firebase/config"
import { useState, useEffect } from "react"

const App = () => {
  const [data, setData] = useState([])
  const [error, setError] = useState(false)
  
  // useState pro form
  const [movieTitle, setMovieTitle] = useState("")
  const [movieAge, setMovieAge] = useState("")
  const [movieTime, setMovieTime] = useState("")


  // Mazání jednotlivých filmů
  const deleteMovie = (id) => {
    projectFirestore.collection("movies").doc(id).delete()
  }

  useEffect(() => {
    // projectFirestore.collection("movies").get().then((snapshot) => {
    const unsubscribe = projectFirestore.collection("movies").onSnapshot((snapshot) => {

      // Validace zdali máme filmy k vypsání
      if (snapshot.empty) {
        setError("Žádné filmy k vypsání")
        setData([])
      } else {
        let result = []
        snapshot.docs.forEach((oneMovie) => {
          result.push({id: oneMovie.id, ...oneMovie.data()})
        })
        setData(result)
        setError("")
      }
    }, (err) => {setError(err.message)})

    // CleanUp function
    return () => {unsubscribe()}
  }, [])

  // Přidávání nových filmů
  const submitForm = async (event) => {
    event.preventDefault()
    const newMovie = {title: movieTitle, time: movieTime, minage: movieAge}

    try {
      await projectFirestore.collection("movies").add(newMovie)
      setMovieTitle("")
      setMovieTime("")
      setMovieAge("")
    } catch (err) {
      setError("Film nebyl přidán " + err.message)
    }
  }

  return <div className="all-movies">
    <form onSubmit={submitForm} className="form">
      <input 
        className="input"
        type="text"
        placeholder="Název filmu"
        value={movieTitle}
        onChange={(e) => setMovieTitle(e.target.value)}
      /> <br />

      <input 
        className="input"
        type="number" 
        min="0"
        placeholder="Čas" 
        value={movieTime}
        onChange={(e) => setMovieTime(e.target.value)}
      /> <br />

      <input 
        className="input"
        type="number" 
        min="0"
        placeholder="Min. věk" 
        value={movieAge}
        onChange={(e) => setMovieAge(e.target.value)}
      /> <br />

      <input type="submit" value="Přidat" />
    </form>

    {error && <p>{error}</p>}
    {data.map((oneMovie) => {
      const {id, title, minage, time} = oneMovie

      return <div key={id} className="one-movie">
        <p>{title}, {time} minut, {minage}+</p>
        <button onClick={() => deleteMovie(id)}>Smazat</button>
      </div>
    })}
  </div>
}

export default App