import Alert from '../models/Alert.js'

export async function getUserAlerts(req, res, next) {
  try {
    const { isRead, severity, type, limit = 50 } = req.query
    const query = { user: req.user._id, isArchived: false }

    if (isRead !== undefined) query.isRead = isRead === 'true'
    if (severity) query.severity = severity
    if (type) query.type = type

    const alerts = await Alert.find(query)
      .populate('project', 'name client')
      .populate('sprint', 'sprintNumber')
      .populate('resource', 'name role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))

    const unreadCount = await Alert.countDocuments({
      user: req.user._id,
      isRead: false,
      isArchived: false
    })

    return res.json({ success: true, data: alerts, unreadCount })
  } catch (error) {
    return next(error)
  }
}

export async function getUnreadCount(req, res, next) {
  try {
    const count = await Alert.countDocuments({
      user: req.user._id,
      isRead: false,
      isArchived: false
    })

    return res.json({ success: true, count })
  } catch (error) {
    return next(error)
  }
}

export async function markAsRead(req, res, next) {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    )

    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' })
    }

    return res.json({ success: true, data: alert })
  } catch (error) {
    return next(error)
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    await Alert.updateMany({ user: req.user._id, isRead: false }, { isRead: true })

    return res.json({ success: true, message: 'All alerts marked as read' })
  } catch (error) {
    return next(error)
  }
}

export async function archiveAlert(req, res, next) {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isArchived: true },
      { new: true }
    )

    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' })
    }

    return res.json({ success: true, message: 'Alert archived' })
  } catch (error) {
    return next(error)
  }
}

export async function deleteAlert(req, res, next) {
  try {
    const alert = await Alert.findOneAndDelete({ _id: req.params.id, user: req.user._id })

    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' })
    }

    return res.json({ success: true, message: 'Alert deleted' })
  } catch (error) {
    return next(error)
  }
}
