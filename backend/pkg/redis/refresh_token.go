package redis

import (
	"strconv"
	"time"
)

func SaveRefreshToken(
	userID uint,
	token string,
	expiry time.Duration,
) error {

	key := "refresh:" + strconv.Itoa(int(userID))

	return Client.Set(
		Ctx,
		key,
		token,
		expiry,
	).Err()

}