const accessToken = "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"
const username = "johnpapa"
const perPageOptions = [10, 30, 50, 100]
let currentPage = 1
let currentPerPage = perPageOptions[0]
let totalrepos = 1

function updateUserDetails(user) {
  const userImage = document.getElementById("userImage")
  userImage.src = user.avatar_url

  totalrepos = user.public_repos

  const userName = document.getElementById("userName")
  userName.innerText = user.login

  const userDetails = document.getElementById("userDetails")
  userDetails.innerHTML = `<p><strong> ${
    user.name || "Not available"
  }</strong></p>
                               <p><strong>${
                                 user.bio || "No description available"
                               }</strong></p>
                               <p><strong>📍 ${
                                 user.location || "Not available"
                               }</strong></p>
                               `

  const profileLink = document.getElementById("profileLink")
  profileLink.innerHTML = `<a href="${user.html_url}" target="_blank">View Profile on GitHub</a>`
  console.log(user.url)
}

function fetchGitHubData() {
  const loader = document.getElementById("loader")
  loader.style.display = "block"

  fetch(`https://api.github.com/users/${username}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((user) => {
      updateUserDetails(user)
    })
    .catch((error) => console.error("Error fetching user details:", error))

  const apiUrl = `https://api.github.com/users/${username}/repos?per_page=${currentPerPage}&page=${currentPage}`
  fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((repositories) => {
      updateRepositories(repositories)
      const totalRepositories = totalrepos
      console.log(totalRepositories)

      updatePaginationBar(totalRepositories, currentPerPage, currentPage)
      loader.style.display = "none"
    })
    .catch((error) => {
      console.error("Error fetching repositories:", error)
      loader.style.display = "none"
    })
}

function updateRepositories(repositories) {
  const repositoriesContainer = document.getElementById("repositories")
  repositoriesContainer.innerHTML = ""

  console.log(repositories)

  repositories.forEach((repository) => {
    const card = document.createElement("div")
    card.className = "repository-card"

    const languageTags = document.createElement("div")
    languageTags.className = "language-tags"

    fetch(repository.languages_url)
      .then((response) => response.json())
      .then((languages) => {
        Object.keys(languages).forEach((language) => {
          const tag = document.createElement("span")
          tag.className = "language-tag"
          tag.innerText = language
          languageTags.appendChild(tag)
        })
      })
      .catch((error) => console.error("Error fetching languages:", error))

    const repoName = document.createElement("h3")
    repoName.className = "repo-name"
    repoName.innerText = repository.name

    const repoDescription = document.createElement("p")
    repoDescription.className = "repo-description"
    repoDescription.innerText =
      repository.description || "No description available"

    card.appendChild(languageTags)
    card.appendChild(repoName)
    card.appendChild(repoDescription)

    repositoriesContainer.appendChild(card)
  })
}

function updatePaginationButtons() {
  document.getElementById("olderBtn").disabled = currentPage === 1
  document.getElementById("newerBtn").disabled = false
}

function navigatePage(direction) {
  if (direction === "older" && currentPage > 1) {
    currentPage--
  } else if (direction === "newer") {
    currentPage++
  }

  fetchGitHubData()
}

function changePerPage(value) {
  currentPerPage = value
  currentPage = 1
  fetchGitHubData()
}

function updatePerPageOptions() {
  const perPageSelect = document.getElementById("perPageSelect")

  if (!perPageSelect) {
    return
  }

  perPageSelect.innerHTML = ""

  perPageOptions.forEach((option) => {
    const optionElement = document.createElement("option")
    optionElement.value = option
    optionElement.innerText = option
    perPageSelect.appendChild(optionElement)
  })
}

function updatePaginationBar(
  totalRepositories,
  repositoriesPerPage,
  currentPage
) {
  console.log("Total Repositories:", totalRepositories)
  console.log("Repositories Per Page:", repositoriesPerPage)
  console.log("Current Page:", currentPage)
  const paginationBar = document.getElementById("pagination-bar")
  paginationBar.innerHTML = ""

  const totalPages = Math.ceil(totalRepositories / repositoriesPerPage)

  for (let i = 1; i <= totalPages; i++) {
    const paginationNumber = document.createElement("div")
    paginationNumber.className = "pagination-number"
    paginationNumber.innerText = i
    paginationNumber.addEventListener("click", () => navigateToPage(i))

    if (i === currentPage) {
      paginationNumber.classList.add("active")
    }

    paginationBar.appendChild(paginationNumber)
  }
}

function navigateToPage(pageNumber) {
  const apiUrl = `https://api.github.com/users/${username}/repos?page=${pageNumber}&per_page=${currentPerPage}`

  fetch(apiUrl)
    .then((response) => response.json())
    .then((repositories) => {
      updateRepositories(repositories)

      const totalRepositories = repositories.length

      updatePaginationBar(totalRepositories, currentPerPage, pageNumber)

      window.scrollTo({ top: 0, behavior: "smooth" })
    })
    .catch((error) => console.error("Error fetching repositories:", error))
}

document.addEventListener("DOMContentLoaded", function () {
  updatePerPageOptions()
  fetchGitHubData()
})
