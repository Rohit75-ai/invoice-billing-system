const Bus = require("./models/bus.model")
const jwt = require("jsonwebtoken")
const User = require("./models/user.model")

module.exports = (io) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token

      if (!token) {
        return next(new Error("Authentication error: Token missing"))
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Find user
      const user = await User.findById(decoded.id)

      if (!user) {
        return next(new Error("Authentication error: User not found"))
      }

      // Attach user to socket
      socket.user = user
      next()
    } catch (error) {
      next(new Error("Authentication error: " + error.message))
    }
  })

  // Handle connections
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user._id}`)

    // Join room based on user role
    if (socket.user.role === "admin") {
      socket.join("admin")
    } else if (socket.user.role === "driver") {
      socket.join("drivers")
    }

    // Handle bus location updates
    socket.on("update-bus-location", async (data) => {
      try {
        const { busId, longitude, latitude } = data

        // Check if user is a driver or admin
        if (socket.user.role !== "driver" && socket.user.role !== "admin") {
          socket.emit("error", { message: "Not authorized to update bus location" })
          return
        }

        // Find bus
        const bus = await Bus.findById(busId)

        if (!bus) {
          socket.emit("error", { message: "Bus not found" })
          return
        }

        // Check if driver is assigned to this bus
        if (socket.user.role === "driver" && bus.driver && bus.driver.toString() !== socket.user._id.toString()) {
          socket.emit("error", {
            message: "You are not authorized to update this bus location",
          })
          return
        }

        // Update location
        bus.location.coordinates = [longitude, latitude]
        bus.lastUpdated = Date.now()
        await bus.save()

        // Broadcast updated location to all clients
        io.emit("bus-location-updated", {
          busId: bus._id,
          busNumber: bus.busId,
          routeName: bus.routeName,
          location: bus.location,
          status: bus.status,
          lastUpdated: bus.lastUpdated,
        })
      } catch (error) {
        socket.emit("error", { message: error.message })
      }
    })

    // Handle bus status updates
    socket.on("update-bus-status", async (data) => {
      try {
        const { busId, status } = data

        // Check if user is a driver or admin
        if (socket.user.role !== "driver" && socket.user.role !== "admin") {
          socket.emit("error", { message: "Not authorized to update bus status" })
          return
        }

        // Find bus
        const bus = await Bus.findById(busId)

        if (!bus) {
          socket.emit("error", { message: "Bus not found" })
          return
        }

        // Check if driver is assigned to this bus
        if (socket.user.role === "driver" && bus.driver && bus.driver.toString() !== socket.user._id.toString()) {
          socket.emit("error", {
            message: "You are not authorized to update this bus status",
          })
          return
        }

        // Update status
        bus.status = status
        await bus.save()

        // Broadcast updated status to all clients
        io.emit("bus-status-updated", {
          busId: bus._id,
          busNumber: bus.busId,
          status: bus.status,
          lastUpdated: Date.now(),
        })
      } catch (error) {
        socket.emit("error", { message: error.message })
      }
    })

    // Handle passenger count updates
    socket.on("update-passenger-count", async (data) => {
      try {
        const { busId, count } = data

        // Check if user is a driver or admin
        if (socket.user.role !== "driver" && socket.user.role !== "admin") {
          socket.emit("error", { message: "Not authorized to update passenger count" })
          return
        }

        // Find bus
        const bus = await Bus.findById(busId)

        if (!bus) {
          socket.emit("error", { message: "Bus not found" })
          return
        }

        // Check if driver is assigned to this bus
        if (socket.user.role === "driver" && bus.driver && bus.driver.toString() !== socket.user._id.toString()) {
          socket.emit("error", {
            message: "You are not authorized to update this bus passenger count",
          })
          return
        }

        // Validate passenger count
        if (count < 0 || count > bus.capacity) {
          socket.emit("error", {
            message: `Passenger count must be between 0 and ${bus.capacity}`,
          })
          return
        }

        // Update passenger count
        bus.currentPassengers = count
        await bus.save()

        // Broadcast updated passenger count to all clients
        io.emit("passenger-count-updated", {
          busId: bus._id,
          busNumber: bus.busId,
          currentPassengers: bus.currentPassengers,
          capacity: bus.capacity,
          lastUpdated: Date.now(),
        })
      } catch (error) {
        socket.emit("error", { message: error.message })
      }
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user._id}`)
    })
  })
}

