async function main() {
  console.log('Hello');
}

main()
  .catch(console.error)
  .finally(() => process.exit());
