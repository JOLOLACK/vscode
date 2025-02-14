const API_KEY = 'api_key=ccce8287f51df54af80b83283695c531'
const url = 'https://api.themoviedb.org/3';
const API_URL = url + '/discover/movie?sort_by=popularity.desc&'

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjY2NlODI4N2Y1MWRmNTRhZjgwYjgzMjgzNjk1YzUzMSIsIm5iZiI6MTcyMTQ5NzgzNy40MDI4OTQsInN1YiI6IjY2OWJmNmU0Y2U5NjhjMGRmYjRiOWQ0MyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.UBNY43dy5mjd_a-DEiVDxBfKjegegkHuD314zvZAUik'

  }
};

const accountId = '21393966'

let totalHour = 0
let isUpdatingBackground = false;
let buttonAccountClick = false

document.addEventListener('DOMContentLoaded', () => {
  const creditsBTN = document.getElementById('credits')
  const accountIdUser= document.getElementById('accountIdUserTMDB')
  const accountIdINP = document.getElementById('accountIdInput')
  const inputField = document.getElementById('inputfield');
  const dropdown = document.getElementById('dropdown');
  const url = 'https://api.themoviedb.org/3';
  const counterTime = document.getElementById('counter')
  const containerDiv = document.getElementById('container')
  const accountCalcBtn = document.getElementById('accountcalculatorBtn')

  const minutesMediaEL = document.getElementById('minutesMedia')
  const hourMediaEL = document.getElementById('hourMedia')
  const dayMediaEL = document.getElementById('dayMedia')


  inputField.addEventListener('input', async (event) => {
    const query = event.target.value;
    console.log(query)
    if (query.length > 5) {
      let textWithPercent20 = inputField.value.replace(/ /g, "%20");
      let urlQuery = `/search/multi?query=${textWithPercent20}`;
      let apiResult = await fetchDataApi(urlQuery);
      dropDownDisplay(apiResult.results)
    }

  });
  

  async function fetchDataApi(query) {
    try {
      const respones = await fetch(url + query, options)
      const data = await respones.json()
      return data

    }
    catch (err) {
      console.error('error fetching api data', err)
      return []
    }

  }

  function dropDownDisplay(data) {
    dropdown.innerHTML = ''; // Clear previous results
    dropdown.style.display = 'block';
    for (let i = 0; i < data.length; i++) {

      let element = data[i];
      console.log(element)
      if (element.poster_path) {

        let dropdownItem = document.createElement('div');
        dropdownItem.classList.add('dropdown-item');

        //console.log(element)

        let nameMedia = element.title
        let releaseDate = element.release_date

        if (element.media_type == "tv") {
          nameMedia = element.name
          releaseDate = element.first_air_date

        }
        dropdownItem.innerHTML = `
                <div class="poster">
                    <img src="https://image.tmdb.org/t/p/w92${element.poster_path}" alt="${nameMedia}">
                </div>
                <div class="details">
                    <h2>${nameMedia}</h2>
                    <p><strong>Release Date:</strong> ${releaseDate}</p>
                </div>`;
        dropdown.appendChild(dropdownItem);

        dropdownItem.addEventListener('click', async () => {
          // console.log(element.media_type, element.id)
          let runTime = await timerCalculator(element.media_type, element.id);
          console.log(runTime)
          addTime(runTime)

          saveDisplay(element.poster_path, element.id, nameMedia, runTime, element.backdrop_path)
          dropdown.style.display = 'none';
          inputField.value = ''
        });
      }
    }
  }

  function updateBackgrounds(url) {
    const newImageUrl = `https://image.tmdb.org/t/p/w500${url}`;
    const elements = document.querySelector('.background');

    if (!isUpdatingBackground) {
      const img = new Image()
      img.src = newImageUrl
      img.onload = () =>{

        isUpdatingBackground = true;
        setTimeout(() => {
          elements.style.backgroundImage = `url(${newImageUrl})`;
          elements.style.opacity = '0.3'
          isUpdatingBackground = false; // Reset the flag after 5 seconds
        }, 1000);
      }
    }
  }

  function saveDisplay(posterPath, id, name, mediaTime, backgorundPoster) {

    let divElement = document.createElement('div')
    divElement.classList.add('movie-card')
    updateBackgrounds(backgorundPoster)


    divElement.innerHTML = `
      <div class="poster" data-id="${id}" data-time="${mediaTime}">
        <img src="https://image.tmdb.org/t/p/w500${posterPath}" alt="${name}">
      </div>`;


    containerDiv.appendChild(divElement)


    divElement.addEventListener('click', () => {
      let timeHtmlEl = divElement.querySelector('.poster')
      console.log(timeHtmlEl)

      reduceTime(timeHtmlEl.dataset.time)
      console.log(timeHtmlEl.dataset.time)
      containerDiv.removeChild(divElement)

    });


  }

  async function timerCalculator(mediaType, id) {
    let quary = mediaType == "tv" ? `/tv/${id}` : `/movie/${id}`
    let apiResult = await fetchDataApi(quary)
    let runTime = 0


    if (mediaType == "tv") {
      let newQuary = `/tv/${id}/season/${1}`

      runTime = (await fetchDataApi(newQuary)).episodes[1].runtime


    }
    let timeMin = mediaType == "tv" ? apiResult.number_of_episodes * runTime : apiResult.runtime
    let tunredHours = timeMin / 60

    return tunredHours

  }


  async function Data(page, mediaType,userId) {
    console.log(`/account/${userId}/rated/${mediaType}?page=${page}&sort_by=created_at.asc`)
    return await fetchDataApi(`/account/${userId}/rated/${mediaType}?page=${page}&sort_by=created_at.asc`)

  }

  accountCalcBtn.addEventListener('click', async () => {
    console.log(accountId)
    if (accountId) {

      buttonAccountClick = true
      let mediaType = "tv"

      for (let i = 0; i < 2; i++) {

        let resultsMovies = await Data(1, mediaType, accountId)

        for (let pages = 1; pages <= resultsMovies.total_pages; pages++) {
          resultsMovies = await Data(pages, mediaType, accountId)

          for (let index = 0; index < resultsMovies.results.length; index++) {
            const element = resultsMovies.results[index];
            let timeDataReturn = await timerCalculator(mediaType, element.id)


            let nameMedia = element.title

            if (element.media_type == "tv") {
              nameMedia = element.name

            }
            saveDisplay(element.poster_path, element.id, nameMedia, timeDataReturn, element.backdrop_path)
            addTime(timeDataReturn)
          } console.log(resultsMovies)
        }
        console.log(mediaType)
        mediaType = "movies"

      }
      buttonAccountClick = false
    }
    else{
      console.error('the input Id is empty')
    }



  })

  creditsBTN.addEventListener('click', () => {
    console.log('hello');
    let creditsEl = document.querySelector('.credits-face');
    displayNoneAndShow(creditsEl)

  })
  User.addEventListener('click', () => {
    console.log('hello');
    let creditsEl = document.querySelector('.account-face-face');
    displayNoneAndShow(creditsEl)

  })
  
  function displayNoneAndShow(doc){
    if (doc) {
      if (doc.style.display === 'none' || doc.style.display === '') {
        doc.style.display = 'flex';
      } else {
        doc.style.display = 'none';
      }
    } else {
      console.error('Element with class "credits-face" not found.');
    }

  }

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.search-container')) {
      dropdown.style.display = 'none';

    }
  });

  function addTime(timeData) {
    //console.log(timeData)

    totalHour += timeData

    updateTime(totalHour)
  }

  function reduceTime(timeData) {
    totalHour -= timeData
    if(totalHour < 0){totalHour = 0}
    updateTime(totalHour)
  }

  function updateTime(timeData) {
    
    if (totalHour == 0) {
      counterTime.style.opacity = '0';
      setTimeout(() => {
        counterTime.classList.remove('show');
        counterTime.style.display = 'none';
      }, 500); // Match this duration to the CSS transition duration
    } else {
      counterTime.style.display = 'flex';
      setTimeout(() => {
        counterTime.classList.add('show');
        counterTime.style.opacity = '1';
      }, 10); // Small delay to allow display change to take effect before transition
    }

    let timeResult = convertHourDaysMinutes(timeData)
    document.getElementById('daysTime').innerText = timeResult.days
    document.getElementById('hoursTime').innerText = timeResult.hours
    document.getElementById('minutesTime').innerText = timeResult.minutes
    
  }
  function convertHourDaysMinutes(totalHours) {
    const days = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;
    const hours = Math.floor(remainingHours);
    const minutes = Math.floor((remainingHours - hours) * 60);

    return { days, hours, minutes };
  }


});
