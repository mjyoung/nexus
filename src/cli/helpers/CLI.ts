import chalk from 'chalk'
import { arg, isError, format } from './utils'
import { Version } from './Version'
import { unknownCommand, HelpError, Command, Commands } from '.'

/**
 * CLI command
 */
export class CLI implements Command {
  static new(cmds: Commands): CLI {
    return new CLI(cmds)
  }
  private constructor(private readonly cmds: Commands) {}

  async parse(argv: string[]) {
    // parse the args according to the following spec
    const args = arg(argv, {
      '--help': Boolean,
      '-h': '--help',
      '--version': Boolean,
      '-v': '--version',
    })
    if (isError(args)) {
      return this.help(args.message)
    }
    if (args['--version']) {
      return Version.new().parse(argv)
    }
    // display help for help flag or no subcommand
    if (args._.length === 0 || args['--help']) {
      return this.help()
    }

    // check if we have that subcommand
    const cmd = this.cmds[args._[0]]
    if (cmd) {
      return cmd.parse(args._.slice(1))
    }
    // unknown command
    return unknownCommand(CLI.help, args._[0])
  }

  // help function
  private help(error?: string): string | HelpError {
    if (error) {
      return new HelpError(`\n${chalk.bold.red(`!`)} ${error}\n${CLI.help}`)
    }
    return CLI.help
  }

  // static help template
  private static help = format(`
    Pumpkins - Nexus & Prisma without the hassle

    ${chalk.bold('Usage')}

      ${chalk.dim(`$`)} pumpkins [command]

    ${chalk.bold('Commands')}

          init   Setup a ready-to-use Pumpkins
           dev   Develop your application in watch mode
         build   Build a production-ready server
      generate   Generate the artifacts
        doctor   Check your project state for any problems

    ${chalk.bold('Examples')}

      Initialize files for a new Pumpkins project
      ${chalk.dim(`$`)} pumpkins init

      Start developing and watch your changes locally
      ${chalk.dim(`$`)} pumpkins dev

      Build a production-ready server
      ${chalk.dim(`$`)} pumpkins build
  `)
}