FROM python:3.10-alpine

ENV CFLAGS="-DSQLITE_DEFAULT_CACHE_SIZE=-8000 \
            -DSQLITE_DEFAULT_FOREIGN_KEYS=1 \
            -DSQLITE_DEFAULT_MEMSTATUS=0 \
            -DSQLITE_DEFAULT_PAGE_SIZE=4096 \
            -DSQLITE_DEFAULT_SYNCHRONOUS=0 \
            -DSQLITE_DEFAULT_WAL_SYNCHRONOUS=0 \
            -DSQLITE_DISABLE_DIRSYNC \
            -DSQLITE_ENABLE_COLUMN_METADATA \
            -DSQLITE_ENABLE_DESERIALIZE \
            -DSQLITE_ENABLE_FTS3 \
            -DSQLITE_ENABLE_FTS3_PARENTHESIS \
            -DSQLITE_ENABLE_FTS4 \
            -DSQLITE_ENABLE_FTS5 \
            -DSQLITE_ENABLE_JSON1 \
            -DSQLITE_ENABLE_MEMDB \
            -DSQLITE_ENABLE_STAT4 \
            -DSQLITE_ENABLE_STMTVTAB \
            -DSQLITE_ENABLE_UNLOCK_NOTIFY \
            -DSQLITE_ENABLE_UPDATE_DELETE_LIMIT \
            -DSQLITE_LIKE_DOESNT_MATCH_BLOBS \
            -DSQLITE_MAX_EXPR_DEPTH=0 \
            -DSQLITE_SOUNDEX \
            -DSQLITE_STMTJRNL_SPILL=-1 \
            -DSQLITE_TEMP_STORE=3 \
            -DSQLITE_USE_ALLOCA \
            -DSQLITE_USE_URI \
            -DSQLITE_DEFAULT_WAL_AUTOCHECKPOINT=512 \
            -DHAVE_USLEEP \
            -O2 -fPIC"

RUN apk add --no-cache --virtual .build-deps build-base libressl coreutils gcc libc-dev linux-headers make tar wget tcl tcl-dev dpkg dpkg-dev \
    && wget -q https://www.sqlite.org/src/tarball/sqlite.tar.gz?r=release -O sqlite.tar.gz \
    && tar xzf sqlite.tar.gz \
    && cd sqlite \
    && buildArch="$(dpkg-architecture --query DEB_BUILD_GNU_TYPE)" \
    && LIBS="-lm" PREFIX="/usr/local" ./configure --build="$buildArch" --disable-tcl --enable-shared --enable-static --enable-tempstore=always --prefix="/usr/local" \
    && make -j$(nproc) \
    && make install \
    && cd .. \
    && rm -rf sqlite sqlite.tar.gz \
    && pip install --no-cache-dir cython flask peewee sqlite-web \
    && apk del .build-deps \
    && adduser -D -h /data appuser
RUN mkdir -p /data && chown -R appuser:appuser /data


VOLUME /data
WORKDIR /data

EXPOSE 8080
USER appuser
CMD ["sh", "-c", "sqlite_web -H 0.0.0.0 -x $SQLITE_DATABASE"]

