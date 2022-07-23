module.exports = async entries => {
  console.log('user-provided beforeCreateDesktopEntry')

  return {
    ...entries,
    Comment: 'This is an incredible app, you should run it right now.',
  }
}
