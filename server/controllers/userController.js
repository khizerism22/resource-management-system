import User from '../models/User.js'

const VALID_ROLES = ['Admin', 'PM', 'TeamLead', 'Stakeholder']

function isSelfOrAdmin(req, userId) {
  return req.user?.role === 'Admin' || String(req.user?._id) === String(userId)
}

export async function getAllUsers(req, res, next) {
  try {
    const { role, search } = req.query
    const query = {}

    if (role) query.role = role
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 })
    return res.json({ success: true, data: users })
  } catch (error) {
    return next(error)
  }
}

export async function getUserById(req, res, next) {
  try {
    if (!isSelfOrAdmin(req, req.params.id)) {
      return res.status(403).json({ success: false, error: 'Not authorized' })
    }

    const user = await User.findById(req.params.id).select('-password')
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }
    return res.json({ success: true, data: user })
  } catch (error) {
    return next(error)
  }
}

export async function createUser(req, res, next) {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, error: 'Name, email, and password are required' })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already exists' })
    }

    if (role && !VALID_ROLES.includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' })
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Stakeholder'
    })

    return res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    return next(error)
  }
}

export async function updateUser(req, res, next) {
  try {
    const { name, email } = req.body

    if (!isSelfOrAdmin(req, req.params.id)) {
      return res.status(403).json({ success: false, error: 'Not authorized' })
    }

    if (email) {
      const existing = await User.findOne({ email: email.toLowerCase() })
      if (existing && String(existing._id) !== String(req.params.id)) {
        return res.status(400).json({ success: false, error: 'Email already exists' })
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    return res.json({ success: true, data: user })
  } catch (error) {
    return next(error)
  }
}

export async function deleteUser(req, res, next) {
  try {
    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Cannot delete own account' })
    }

    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    return res.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    return next(error)
  }
}

export async function changeUserRole(req, res, next) {
  try {
    const { role } = req.body

    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Cannot change own role' })
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' })
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    return res.json({ success: true, data: user })
  } catch (error) {
    return next(error)
  }
}
