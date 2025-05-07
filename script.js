// DOM Elements
const loginPage = document.getElementById("login-page")
const mainApp = document.getElementById("main-app")
const loginBtn = document.getElementById("login-btn")
const logoutBtn = document.getElementById("logout-btn")
const toggleSidebarBtn = document.getElementById("toggle-sidebar")
const sidebar = document.querySelector(".sidebar")
const navItems = document.querySelectorAll(".nav-item")
const contentSections = document.querySelectorAll(".content-section")
const currentDateEl = document.getElementById("current-date")
const currentTimeEl = document.getElementById("current-time")
const mapElement = document.getElementById("map")
const locateMeBtn = document.getElementById("locate-me")
const refreshMapBtn = document.getElementById("refresh-map")
const scheduleTabBtns = document.querySelectorAll(".tab-btn")
const paymentCards = document.querySelectorAll(".payment-card")
const paymentMethods = document.querySelectorAll(".payment-method")
const ticketTypeInputs = document.querySelectorAll('input[name="ticket-type"]')
const fromLocationSelect = document.getElementById("from-location")
const toLocationSelect = document.getElementById("to-location")
const saveProfileBtn = document.querySelector(".save-profile-btn")

// Global variables
let map
let busMarkers = []
let userMarker

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  // Set current date and time
  updateDateTime()
  setInterval(updateDateTime, 60000)

  // Initialize map if on dashboard
  if (mapElement) {
    initMap()
  }

  // Populate bus list with sample data
  populateBusList()

  // Populate schedule with sample data
  populateSchedule()
})

// Login functionality
loginBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value
  const password = document.getElementById("password").value

  // Simple validation
  if (!username || !password) {
    alert("Please enter both username and password")
    return
  }

  // In a real app, you would send these credentials to a server
  // For demo purposes, we'll just switch to the main app
  loginPage.classList.remove("active")
  mainApp.classList.add("active")

  // Update user info
  document.getElementById("user-name").textContent = username
  document.getElementById("profile-name").textContent = username

  // Initialize map if not already initialized
  if (mapElement && !map) {
    initMap()
  }
})

// Logout functionality
logoutBtn.addEventListener("click", () => {
  mainApp.classList.remove("active")
  loginPage.classList.add("active")
})

// Toggle sidebar on mobile
toggleSidebarBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active")
})

// Navigation functionality
navItems.forEach((item) => {
  item.addEventListener("click", function () {
    // Update active nav item
    navItems.forEach((nav) => nav.classList.remove("active"))
    this.classList.add("active")

    // Show corresponding content section
    const target = this.getAttribute("data-target")
    contentSections.forEach((section) => {
      section.classList.remove("active")
      if (section.id === target) {
        section.classList.add("active")
      }
    })

    // Initialize map if navigating to dashboard
    if (target === "dashboard" && mapElement && !map) {
      initMap()
    }

    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768) {
      sidebar.classList.remove("active")
    }
  })
})

// Update date and time
function updateDateTime() {
  const now = new Date()
  const dateOptions = { year: "numeric", month: "long", day: "numeric" }
  const timeOptions = { hour: "2-digit", minute: "2-digit" }

  if (currentDateEl) {
    currentDateEl.textContent = now.toLocaleDateString("en-US", dateOptions)
  }

  if (currentTimeEl) {
    currentTimeEl.textContent = now.toLocaleTimeString("en-US", timeOptions)
  }
}

// Initialize map
function initMap() {
  if (!mapElement) return

  // Create map centered at university (example coordinates)
  map = L.map("map").setView([40.7128, -74.006], 15)

  // Add tile layer (OpenStreetMap)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map)

  // Add sample bus markers
  addBusMarkers()

  // Add event listeners for map controls
  locateMeBtn.addEventListener("click", locateUser)
  refreshMapBtn.addEventListener("click", refreshMap)
}

// Add sample bus markers to the map
function addBusMarkers() {
  if (!map) return

  // Clear existing markers
  busMarkers.forEach((marker) => map.removeLayer(marker))
  busMarkers = []

  // Sample bus data
  const buses = [
    { id: "BUS-001", route: "North Campus", lat: 40.7135, lng: -74.006, status: "active" },
    { id: "BUS-002", route: "South Campus", lat: 40.712, lng: -74.007, status: "active" },
    { id: "BUS-003", route: "East Campus", lat: 40.7128, lng: -74.004, status: "delayed" },
  ]

  // Create custom bus icon
  const busIcon = L.divIcon({
    className: "bus-marker",
    html: '<i class="fas fa-bus" style="color: #3498db; font-size: 24px;"></i>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

  // Add markers for each bus
  buses.forEach((bus) => {
    const marker = L.marker([bus.lat, bus.lng], { icon: busIcon }).addTo(map)
    marker.bindPopup(`
      <strong>${bus.route}</strong><br>
      Bus ID: ${bus.id}<br>
      Status: ${bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
    `)
    busMarkers.push(marker)
  })
}

// Locate user on the map
function locateUser() {
  if (!map) return

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude
        const userLng = position.coords.longitude

        // Create or update user marker
        if (userMarker) {
          userMarker.setLatLng([userLat, userLng])
        } else {
          const userIcon = L.divIcon({
            className: "user-marker",
            html: '<i class="fas fa-user-circle" style="color: #e74c3c; font-size: 24px;"></i>',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })

          userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map)
          userMarker.bindPopup("Your Location")
        }

        // Center map on user
        map.setView([userLat, userLng], 16)
      },
      (error) => {
        alert("Unable to get your location: " + error.message)
      },
    )
  } else {
    alert("Geolocation is not supported by your browser")
  }
}

// Refresh map and bus positions
function refreshMap() {
  if (!map) return

  // Simulate refreshing bus positions
  addBusMarkers()

  // Show refresh animation
  refreshMapBtn.classList.add("rotating")
  setTimeout(() => {
    refreshMapBtn.classList.remove("rotating")
  }, 1000)
}

// Populate bus list with sample data
function populateBusList() {
  const busList = document.querySelector(".bus-list")
  if (!busList) return

  // Sample bus data
  const buses = [
    { id: "BUS-001", route: "North Campus", driver: "John Smith", passengers: 12, status: "active" },
    { id: "BUS-002", route: "South Campus", driver: "Sarah Johnson", passengers: 18, status: "active" },
    { id: "BUS-003", route: "East Campus", driver: "Mike Brown", passengers: 8, status: "delayed" },
    { id: "BUS-004", route: "West Campus", driver: "Emily Davis", passengers: 0, status: "inactive" },
  ]

  // Create HTML for each bus
  buses.forEach((bus) => {
    const busItem = document.createElement("div")
    busItem.className = "bus-item"

    let statusClass = ""
    switch (bus.status) {
      case "active":
        statusClass = "status-active"
        break
      case "delayed":
        statusClass = "status-delayed"
        break
      case "inactive":
        statusClass = "status-inactive"
        break
    }

    busItem.innerHTML = `
      <div class="bus-icon">
        <i class="fas fa-bus"></i>
      </div>
      <div class="bus-info">
        <div class="bus-route">${bus.route} (${bus.id})</div>
        <div class="bus-details">Driver: ${bus.driver} | Passengers: ${bus.passengers}</div>
      </div>
      <div class="bus-status-indicator ${statusClass}"></div>
    `

    busList.appendChild(busItem)
  })
}

// Populate schedule with sample data
function populateSchedule() {
  const scheduleBody = document.getElementById("schedule-body")
  if (!scheduleBody) return

  // Sample schedule data
  const schedules = [
    { route: "North Campus", busId: "BUS-001", departure: "07:30 AM", arrival: "08:00 AM", status: "on-time" },
    { route: "South Campus", busId: "BUS-002", departure: "08:00 AM", arrival: "08:30 AM", status: "on-time" },
    { route: "East Campus", busId: "BUS-003", departure: "08:30 AM", arrival: "09:00 AM", status: "delayed" },
    { route: "West Campus", busId: "BUS-004", departure: "09:00 AM", arrival: "09:30 AM", status: "on-time" },
    { route: "North Campus", busId: "BUS-001", departure: "09:30 AM", arrival: "10:00 AM", status: "on-time" },
    { route: "South Campus", busId: "BUS-002", departure: "10:00 AM", arrival: "10:30 AM", status: "cancelled" },
  ]

  // Create HTML for each schedule
  schedules.forEach((schedule) => {
    const row = document.createElement("tr")

    row.innerHTML = `
      <td>${schedule.route}</td>
      <td>${schedule.busId}</td>
      <td>${schedule.departure}</td>
      <td>${schedule.arrival}</td>
      <td><span class="status status-${schedule.status}">${schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}</span></td>
    `

    scheduleBody.appendChild(row)
  })
}

// Schedule tab functionality
scheduleTabBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    scheduleTabBtns.forEach((tab) => tab.classList.remove("active"))
    this.classList.add("active")

    // In a real app, you would fetch and display different schedules based on the selected tab
    // For demo purposes, we'll just show the same schedule
  })
})

// Payment card selection
paymentCards.forEach((card) => {
  card.addEventListener("click", function () {
    paymentCards.forEach((c) => c.classList.remove("active"))
    this.classList.add("active")

    // Update payment details title
    const paymentTitle = document.querySelector(".payment-details h3")
    if (paymentTitle) {
      paymentTitle.textContent = this.querySelector("span").textContent
    }

    // In a real app, you would update the payment form based on the selected payment type
  })
})

// Payment method selection
paymentMethods.forEach((method) => {
  method.addEventListener("click", function () {
    paymentMethods.forEach((m) => m.classList.remove("active"))
    this.classList.add("active")

    // Select the radio input
    const radio = this.querySelector('input[type="radio"]')
    if (radio) {
      radio.checked = true
    }
  })
})

// Update payment summary when ticket type changes
ticketTypeInputs.forEach((input) => {
  input.addEventListener("change", function () {
    const priceElement = document.querySelector(".summary-item:first-child span:last-child")
    const totalElement = document.querySelector(".summary-item.total span:last-child")

    if (priceElement && totalElement) {
      if (this.id === "one-way") {
        priceElement.textContent = "$2.00"
        totalElement.textContent = "$2.25"
      } else {
        priceElement.textContent = "$3.50"
        totalElement.textContent = "$3.75"
      }
    }
  })
})

// Update route options when from/to locations change
fromLocationSelect.addEventListener("change", updateRouteOptions)
toLocationSelect.addEventListener("change", updateRouteOptions)

function updateRouteOptions() {
  const fromValue = fromLocationSelect.value
  const toValue = toLocationSelect.value

  // Disable selecting the same location for both from and to
  Array.from(fromLocationSelect.options).forEach((option) => {
    option.disabled = option.value === toValue && option.value !== ""
  })

  Array.from(toLocationSelect.options).forEach((option) => {
    option.disabled = option.value === fromValue && option.value !== ""
  })
}

// Save profile changes
saveProfileBtn.addEventListener("click", () => {
  // In a real app, you would validate and send the form data to a server
  // For demo purposes, we'll just show a success message
  alert("Profile changes saved successfully!")
})

// Add CSS for map marker rotation animation
const style = document.createElement("style")
style.textContent = `
  .rotating {
    animation: rotate 1s linear;
  }
  
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .bus-marker, .user-marker {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`
document.head.appendChild(style)

// Declare L variable to fix the undeclared variable issue
const L = window.L




