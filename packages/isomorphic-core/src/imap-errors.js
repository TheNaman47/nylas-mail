/**
 * An abstract base class that can be used to indicate IMAPErrors that may
 * fix themselves when retried
 */
class RetryableError extends Error { }

/**
 * IMAPErrors that originate from NodeIMAP. See `convertImapError` for
 * documentation on underlying causes
 */
class IMAPSocketError extends RetryableError { }
class IMAPConnectionTimeoutError extends RetryableError { }
class IMAPAuthenticationTimeoutError extends RetryableError { }
class IMAPProtocolError extends Error { }
class IMAPAuthenticationError extends Error { }

class IMAPConnectionNotReadyError extends RetryableError {
  constructor(funcName) {
    super(`${funcName} - You must call connect() first.`);
  }
}

class IMAPConnectionEndedError extends Error {
  constructor(msg = "The IMAP Connection was ended.") {
    super(msg);
  }
}

/**
 * IMAPErrors may come from:
 *
 * 1. Underlying IMAP provider (Fastmail, Yahoo, etc)
 * 2. Node IMAP
 * 3. K2 code
 *
 * NodeIMAP puts a `source` attribute on `Error` objects to indicate where
 * a particular error came from. See https://github.com/mscdex/node-imap/blob/master/lib/Connection.js
 *
 * These may have the following values:
 *
 *   - "socket-timeout": Created by NodeIMAP when `config.socketTimeout`
 *     expires on the base Node `net.Socket` and socket.on('timeout') fires
 *     Message: 'Socket timed out while talking to server'
 *
 *   - "timeout": Created by NodeIMAP when `config.connTimeout` has been
 *     reached when trying to connect the socket.
 *     Message: 'Timed out while connecting to server'
 *
 *   - "socket": Created by Node's `net.Socket` on error. See:
 *     https://nodejs.org/api/net.html#net_event_error_1
 *     Message: Various from `net.Socket`
 *
 *   - "protocol": Created by NodeIMAP when `bad` or `no` types come back
 *     from the IMAP protocol.
 *     Message: Various from underlying IMAP protocol
 *
 *   - "authentication": Created by underlying IMAP connection or NodeIMAP
 *     in a few scenarios.
 *     Message: Various from underlying IMAP connection
 *              OR: No supported authentication method(s) available. Unable to login.
 *              OR: Logging in is disabled on this server
 *
 *   - "timeout-auth": Created by NodeIMAP when `config.authTimeout` has
 *     been reached when trying to authenticate
 *     Message: 'Timed out while authenticating with server'
 *
 */
function convertImapError(imapError) {
  let error;
  switch (imapError.source) {
    case "socket-timeout":
      error = new IMAPConnectionTimeoutError(imapError); break;
    case "timeout":
      error = new IMAPConnectionTimeoutError(imapError); break;
    case "socket":
      error = new IMAPSocketError(imapError); break;
    case "protocol":
      error = new IMAPProtocolError(imapError); break;
    case "authentication":
      error = new IMAPAuthenticationError(imapError); break;
    case "timeout-auth":
      error = new IMAPAuthenticationTimeoutError(imapError); break;
    default:
      return error
  }
  error.source = imapError.source
  return error
}

module.exports = {
  convertImapError,
  RetryableError,
  IMAPSocketError,
  IMAPConnectionTimeoutError,
  IMAPAuthenticationTimeoutError,
  IMAPProtocolError,
  IMAPAuthenticationError,
  IMAPConnectionNotReadyError,
  IMAPConnectionEndedError,
};
